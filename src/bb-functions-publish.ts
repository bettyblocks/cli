/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import ora from 'ora';
import os from 'os';
import path from 'path';
import program from 'commander';
import prompts from 'prompts';

/* internal dependencies */

import IDE from './utils/ide';
import acquireFunctionsProject from './utils/acquireFunctionsProject';

/* process arguments */

program
  .name('bb functions publish')
  .option('-b, --bump', 'Bump the revision number.')
  .option('-s, --skip', 'Skip building the custom functions bundle.')
  .option(
    '-h, --host <host>',
    'Set hostname to publish to. Defaults to <identifier>.bettyblocks.com',
  )
  .parse(process.argv);

const bumpRevision = program.bump;
const skipBuild = program.skip;
const { host } = program;

/* execute command */

const workingDir = process.cwd();
const identifier = acquireFunctionsProject(workingDir);

const targetHost = host || `https://${identifier}.bettyblocks.com`;

type NamedObject = Record<string, string | object>;

type MetaData = {
  [name: string]: {
    replace?: string;
    returnType: string;
    inputVariables: NamedObject;
  };
};

type CustomFunction = {
  id: string;
  name: string;
  revision: number;
};

type CustomFunctions = CustomFunction[];

type Action = {
  id: string;
  description: string;
  use_new_runtime: boolean;
};

type Actions = Action[];

const resolveMissingFunction = async (
  groomed: MetaData,
  metaData: MetaData,
  name: string,
  body: string,
): Promise<MetaData> => {
  const { replace } = await prompts({
    type: 'toggle',
    name: 'replace',
    message: `Function "${name}" is missing. What do you want to do?`,
    initial: false,
    active: 'replace',
    inactive: 'add',
  });

  if (replace) {
    const choices = Object.keys(metaData).filter(key => !groomed[key]);
    let replacedFunction;

    if (choices.length === 1) {
      const confirm = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Replace "${choices[0]}"?`,
        initial: true,
      });
      if (confirm.value) [replacedFunction] = choices;
      else throw new Error('Abort.');
    } else {
      replacedFunction = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Replace',
        choices: choices.map(key => ({ title: key, value: key })),
        initial: 0,
      })).value;
    }

    // eslint-disable-next-line no-param-reassign
    groomed[name] = metaData[replacedFunction];
    // eslint-disable-next-line no-param-reassign
    groomed[name].replace = replacedFunction;
    // eslint-disable-next-line no-param-reassign
    delete metaData[replacedFunction];
  } else {
    const matches = body.match(/await context\((["'])(.*?)\1\)/g);
    const defaultInputVariables = (matches || [])
      .map(m => `${m.slice(15, -2)}:string`)
      .join(' ');

    const { returnType, inputVariables } = await prompts([
      {
        type: 'select',
        name: 'returnType',
        message: `What is the return type of the function?`,
        choices: [
          { title: 'string', value: 'string' },
          { title: 'integer', value: 'integer' },
          { title: 'boolean', value: 'boolean' },
        ],
        initial: 0,
      } as prompts.PromptObject,
      {
        type: 'text',
        name: 'inputVariables',
        message: 'What are the input variables?',
        initial: defaultInputVariables,
      } as prompts.PromptObject,
    ]);

    // eslint-disable-next-line no-param-reassign
    groomed[name] = {
      returnType,
      inputVariables: inputVariables.split(/(\s|,)/).reduce(
        (variables: NamedObject, variable: string): NamedObject => {
          if (variable.length) {
            const [varName, varType] = variable.split(':');
            // eslint-disable-next-line no-param-reassign
            variables[varName] = varType;
          }
          return variables;
        },
        {} as NamedObject,
      ),
    };
  }

  return groomed;
};

const groomMetaData = async (): Promise<MetaData> => {
  console.log('Grooming functions.json ...');

  const buildDir = path.join(os.tmpdir(), identifier);
  const customJsFile = path.join(buildDir, 'dist', 'custom.js');
  // eslint-disable-next-line no-new-func
  const customFunctions = new Function(
    `${fs.readFileSync(customJsFile, 'utf8')}; return custom`,
  )();
  const functionsJsonFile = path.join(workingDir, 'functions.json');
  const metaData = fs.readJsonSync(functionsJsonFile);

  const groomedMetaData = await Object.keys(customFunctions).reduce(
    async (promise: Promise<MetaData>, name: string): Promise<MetaData> => {
      return promise.then(async groomed => {
        // eslint-disable-next-line no-param-reassign
        groomed[name] = metaData[name];

        if (!groomed[name]) {
          // eslint-disable-next-line no-param-reassign
          groomed = await resolveMissingFunction(
            groomed,
            metaData,
            name,
            customFunctions[name].toString(),
          );
        }

        return groomed;
      });
    },
    Promise.resolve({} as MetaData),
  );

  fs.writeFileSync(functionsJsonFile, JSON.stringify(groomedMetaData, null, 2));

  return groomedMetaData;
};

const publishFunctions = async (
  metaData: MetaData,
): Promise<string | object | null> => {
  const ide = new IDE(targetHost);

  const customFunctions = (await ide.get(
    'bootstrap/custom_functions',
  )) as CustomFunctions;

  const revision =
    customFunctions.reduce((rev, func) => Math.max(rev, func.revision), 0) +
    (bumpRevision ? 1 : 0);

  const ids: NamedObject = customFunctions.reduce(
    (map, { id, name }) => ({ ...map, [name]: id }),
    {},
  );

  await Object.keys(metaData).reduce(
    async (promise: Promise<string | object | null>, name: string) => {
      await promise;
      const { replace, returnType, inputVariables } = metaData[name];
      const id = ids[replace || name];
      const method = id ? 'put' : 'post';
      const action = id ? 'Updating' : 'Creating';
      const params = {
        name,
        revision,
        return_type: returnType,
        input_variables: inputVariables,
      };
      return ide[method](
        `custom_functions/${id || 'new'}`,
        { json: { record: params } },
        `${action} custom function "${replace || name}" ...`,
      );
    },
    Promise.resolve(null),
  );

  const buildDir = path.join(os.tmpdir(), identifier);
  const customJsFile = path.join(buildDir, 'dist', 'custom.js');

  await ide.post(
    `custom_functions/${revision}`,
    { multiPartData: [{ name: 'code', file: customJsFile }] },
    `Uploading "${revision}.js" ...`,
  );

  const actions = (await ide.get('actions')) as Actions;

  return actions.reduce(
    async (
      promise: Promise<string | object | null>,
      { id, use_new_runtime, description }: Action,
    ) => {
      await promise;
      if (use_new_runtime) {
        return ide.put(
          `actions/${id}`,
          { json: { record: { description } } },
          `Compiling action "${description}" ...`,
        );
      }
      return Promise.resolve(null);
    },
    Promise.resolve(null),
  );
};

const cleanMetaData = async (): Promise<void> => {
  const functionsJsonFile = path.join(workingDir, 'functions.json');
  const metaData = fs.readJsonSync(functionsJsonFile);

  Object.keys(metaData).forEach(name => {
    delete metaData[name].replace;
  });

  fs.writeFileSync(functionsJsonFile, JSON.stringify(metaData, null, 2));
};

console.log(`Publishing to ${targetHost} ...`);

new Promise((resolve): void => {
  if (skipBuild) {
    resolve(undefined);
  } else {
    const building = ora(
      `Building custom functions bundle (this can take a while) ...`,
    ).start();
    const build = spawn('bb functions build', {
      shell: true,
    });
    build.on('close', () => {
      building.succeed();
      resolve(undefined);
    });
  }
})
  .then(groomMetaData)
  .then(publishFunctions)
  .then(cleanMetaData)
  .then(() => {
    console.log('Done.');
  })
  .catch((err: NodeJS.ErrnoException) => {
    console.log(`${err}\nAbort.`);
    process.exit();
  });
