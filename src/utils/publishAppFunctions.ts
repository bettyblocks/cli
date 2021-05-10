/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import ora from 'ora';
import os from 'os';
import path from 'path';
import prompts from 'prompts';

/* internal dependencies */

import IDE from './ide';
import acquireAppFunctionsProject from './acquireAppFunctionsProject';

/* execute command */

const workingDir = process.cwd();
let identifier: string;

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
};

type CustomFunctions = CustomFunction[];

const resolveMissingFunction = async (
  groomed: MetaData,
  metaData: MetaData,
  name: string,
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
        message: 'What are the input variables? (`name:type name:type ...`)',
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

  const functionsJsonFile = path.join(workingDir, 'functions.json');
  const metaData = fs.readJsonSync(functionsJsonFile);
  const appFunctions: string[] = [];

  fs.readdirSync(workingDir).forEach(file => {
    if (file.match(/\.js$/)) {
      const name = file
        .replace(/\.js$/, '')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
      appFunctions.push(name);
    }
  });

  const groomedMetaData = await appFunctions.reduce(
    async (promise: Promise<MetaData>, name: string): Promise<MetaData> => {
      return promise.then(async groomed => {
        // eslint-disable-next-line no-param-reassign
        groomed[name] = metaData[name];

        if (!groomed[name]) {
          // eslint-disable-next-line no-param-reassign
          groomed = await resolveMissingFunction(groomed, metaData, name);
        }

        return groomed;
      });
    },
    Promise.resolve({} as MetaData),
  );

  const json = `${JSON.stringify(groomedMetaData, null, 2)}\n`;
  fs.writeFileSync(functionsJsonFile, json);

  return groomedMetaData;
};

const publishFunctions = async (
  targetHost: string,
  metaData: MetaData,
): Promise<void> => {
  const ide = new IDE(targetHost);

  const customFunctions = (await ide.get(
    'bootstrap/custom_functions',
  )) as CustomFunctions;

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
        return_type: returnType,
        input_variables: inputVariables,
      };
      return ide[method](
        `custom_functions/${id || 'new'}`,
        { json: { record: params } },
        `${action} app function "${replace || name}" ...`,
      );
    },
    Promise.resolve(null),
  );

  const tmpDir = path.join(os.tmpdir(), identifier);
  const zipFile = `${tmpDir}/app.zip`;

  let spinner = ora(`Creating ${zipFile} ...`).start();
  fs.ensureDirSync(tmpDir);

  const zip = new AdmZip();
  fs.readdirSync(workingDir).forEach(file => zip.addLocalFile(file));
  zip.writeZip(zipFile);

  spinner.succeed();

  await ide.webhead.get('/');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const text: any = ide.webhead.text() || '';
  const uuid = (text.match(/Betty\.application_id = '([0-9a-f]+)'/) || [])[1];

  await ide.fusionAuth.ensureLogin();
  spinner = ora(`Uploading ${zipFile} ...`).start();
  const success = await ide.fusionAuth.upload(uuid, zipFile);
  spinner[success ? 'succeed' : 'fail']();
};

const cleanMetaData = async (): Promise<void> => {
  const functionsJsonFile = path.join(workingDir, 'functions.json');
  const metaData = fs.readJsonSync(functionsJsonFile);

  Object.keys(metaData).forEach(name => {
    delete metaData[name].replace;
  });

  fs.writeFileSync(functionsJsonFile, JSON.stringify(metaData, null, 2));
};

const publishAppFunctions = (host: string): void => {
  identifier = acquireAppFunctionsProject(workingDir);

  const targetHost = host || `https://${identifier}.bettyblocks.com`;
  console.log(`Publishing to ${targetHost} ...`);

  groomMetaData()
    .then((metaData: MetaData) => publishFunctions(targetHost, metaData))
    .then(cleanMetaData)
    .then(() => {
      console.log('Done.');
    })
    .catch((err: NodeJS.ErrnoException) => {
      console.log(`${err}\nAbort.`);
      process.exit();
    });
};

export default publishAppFunctions;
