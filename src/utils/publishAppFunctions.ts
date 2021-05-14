/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import ora from 'ora';
import os from 'os';
import path from 'path';

/* internal dependencies */

import IDE from './ide';
import acquireAppFunctionsProject from './acquireAppFunctionsProject';

import {
  MetaData,
  resolveMissingFunction,
  storeCustomFunctions,
} from './publishFunctions';

/* execute command */

const workingDir = process.cwd();
let identifier: string;

type CustomFunction = {
  id: string;
  name: string;
};

type CustomFunctions = CustomFunction[];

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
  await storeCustomFunctions(ide, metaData);

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
