/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import ora from 'ora';
import path from 'path';

/* internal dependencies */

import IDE from '../utils/ide';
import {
  zipFunctionDefinitions,
  functionDefinitions,
} from './functionDefinitions';

import { Config, readConfig } from './config';

/* execute command */

const workingDir = process.cwd();

const publishFunctions = async (config: Config): Promise<void> => {
  const ide = new IDE(config.host, config.zone);
  await ide.fusionAuth.ensureLogin();

  let spinner = ora(`Creating functions zip ...`).start();
  const functionsDir = path.join(workingDir, 'functions');
  const zipFile = zipFunctionDefinitions(functionsDir);
  spinner.succeed();

  const functions = functionDefinitions(functionsDir);

  spinner = ora(`Uploading functions ...`).start();
  const success = await ide.fusionAuth.upload(config, zipFile, functions);
  spinner[success ? 'succeed' : 'fail']();
};

const publishAppFunctions = (): void => {
  const config = readConfig();
  console.log(`Publishing to ${config.host} (${config.zone}) ...`);

  publishFunctions(config).then(() => {
    console.log('Done.');
  });
};

export default publishAppFunctions;
