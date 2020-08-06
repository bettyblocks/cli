/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import program from 'commander';
import prompts from 'prompts';

/* internal dependencies */

import IDE from './utils/ide';
import withinFunctionsProject from './utils/withinFunctionsProject';

/* process arguments */

program.name('bb functions publish').parse(process.argv);

/* execute command */

const workingDir = process.cwd();

type NamedObject = Record<string, string | object>;

type MetaData = {
  [name: string]: {
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
  // eslint-disable-next-line camelcase
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

const groomMetaData = async (identifier: string): Promise<MetaData> => {
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

const sleep = (milliseconds: number): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const publishFunctions = async (
  identifier: string,
  metaData: MetaData,
): Promise<void> => {
  const ide = new IDE(identifier);
  const customFunctions = (await ide.get(
    'bootstrap/custom_functions',
  )) as CustomFunctions;
  const revision = customFunctions.reduce((rev, func) => {
    return Math.max(rev, func.revision);
  }, 0);

  const ids: NamedObject = customFunctions.reduce(
    (map, { id, name }) => ({ ...map, [name]: id }),
    {},
  );

  let promises: Promise<void | string | object | null>[] = Object.keys(
    metaData,
  ).map(
    async (name: string): Promise<void> => {
      const { returnType, inputVariables } = metaData[name];
      const id = ids[name];
      const params = {
        name,
        revision,
        returnType,
        inputVariables,
      };

      if (id) {
        console.log(`Updating custom function "${name}" ...`);
        await ide.put(`custom_functions/${id}`, { record: params });
      } else {
        console.log(`Creating custom function "${name}" ...`);
        await ide.post('custom_functions/new', { record: params });
      }
    },
  );

  console.log(`Uploading "${revision}.js" ...`);
  const buildDir = path.join(os.tmpdir(), identifier);
  const customJsFile = path.join(buildDir, 'dist', 'custom.js');

  await ide.post(`custom_functions/${revision}`, {
    code: `file://${customJsFile}`,
  });

  promises.push(
    ide.post(`custom_functions/${revision}`, {
      code: `file://${customJsFile}`,
    }),
  );

  const actions = (await ide.get('actions')) as Actions;

  promises = promises.concat(
    actions.map(
      async ({ id, description, use_new_runtime }: Action): Promise<void> => {
        if (use_new_runtime) {
          console.log(`Compiling action "${description}" ...`);
          await ide.put(`actions/${id}`, { record: { description } });
        }
      },
    ),
  );

  await Promise.all(promises);
  await sleep(400);

  await ide.close();
};

withinFunctionsProject(workingDir, (identifier: string): void => {
  console.log(`Publishing to ${identifier}.bettyblocks.com ...`);

  console.log(`Bundling custom functions ...`);
  const build = spawn('bb functions build', {
    shell: true,
  });

  build.on('close', async () => {
    const metaData = await groomMetaData(identifier);
    await publishFunctions(identifier, metaData);
    console.log('Done.');
  });
});
