/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import ora from 'ora';
import os from 'os';
import path from 'path';
import vm from 'vm';

/* internal dependencies */

import IDE from './ide';
import acquireCustomFunctionsProject from './acquireCustomFunctionsProject';

import {
  MetaData,
  NamedObject,
  resolveMissingFunction,
} from './publishFunctions';

/* execute command */

const workingDir = process.cwd();
let identifier: string;

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

const groomMetaData = async (): Promise<MetaData> => {
  console.log('Grooming functions.json ...');

  const buildDir = path.join(os.tmpdir(), identifier);
  const customJsFile = path.join(buildDir, 'dist', 'custom.js');

  const customJs = fs.readFileSync(customJsFile, 'utf8');
  const script = new vm.Script(`${customJs}; fn = custom;`);

  const ctx = { fn: {} };
  script.runInNewContext(ctx);
  const customFunctions = ctx.fn as NamedObject;

  const functionsJsonFile = path.join(workingDir, 'functions.json');
  const metaData = fs.readJsonSync(functionsJsonFile);

  const groomedMetaData = await Object.keys(customFunctions).reduce(
    async (promise: Promise<MetaData>, name: string): Promise<MetaData> => {
      return promise.then(async groomed => {
        // eslint-disable-next-line no-param-reassign
        groomed[name] = metaData[name];

        if (!groomed[name]) {
          const matches = customFunctions[name]
            .toString()
            .match(/await context\((["'])(.*?)\1\)/g);

          const defaultInputVariables = (matches || [])
            .map(m => `${m.slice(15, -2)}:string`)
            .join(' ');

          // eslint-disable-next-line no-param-reassign
          groomed = await resolveMissingFunction(
            groomed,
            metaData,
            name,
            defaultInputVariables,
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
  targetHost: string,
  metaData: MetaData,
  bumpRevision: boolean,
): Promise<void> => {
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

  await actions.reduce(
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

const publishCustomFunctions = (
  host: string,
  bumpRevision: boolean,
  skipBuild: boolean,
): void => {
  identifier = acquireCustomFunctionsProject(workingDir);

  const targetHost = host || `https://${identifier}.bettyblocks.com`;
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
    .then((metaData: MetaData) =>
      publishFunctions(targetHost, metaData, bumpRevision),
    )
    .then(cleanMetaData)
    .then(() => {
      console.log('Done.');
    })
    .catch((err: NodeJS.ErrnoException) => {
      console.log(`${err}\nAbort.`);
      process.exit();
    });
};

export default publishCustomFunctions;
