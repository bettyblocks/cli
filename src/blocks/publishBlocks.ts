/* eslint-disable camelcase */
/* npm dependencies */

import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import FormData from 'form-data';

/* internal dependencies */

import chalk from 'chalk';
import {
  functionDefinitions,
  stringifyDefinitions,
  whitelistedFunctions,
} from '../functions/functionDefinitions';
import FusionAuth from '../utils/login';

import Config from '../functions/config';

/* execute command */

const workingDir = process.cwd();

const uploadBlock = async (
  blockDefinitionsFile: string,
  functionsJson: string,
  config: Config,
): Promise<boolean> => {
  const fusionAuth = new FusionAuth(config);

  const form = new FormData();
  form.append('name', path.basename(blockDefinitionsFile, '.zip'));
  form.append('functions', functionsJson);
  form.append('file', fs.createReadStream(blockDefinitionsFile));

  const applicationId = await config.applicationId();
  if (!applicationId) {
    throw new Error(
      "Couldn't publish block(s), Error: application id not found",
    );
  }
  const url = `${config.blockstoreApiUrl}/blocks/publish`;

  return fetch(url, {
    agent: config.agent,
    method: 'POST',
    body: form,
    headers: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Authorization: `Bearer ${fusionAuth.jwt()}`,
      ApplicationId: applicationId,
      Accept: 'application/json',
    },
  }).then(async (res) => {
    if (res.status === 401 || res.status === 403) {
      await fusionAuth.ensureLogin();
      return uploadBlock(blockDefinitionsFile, functionsJson, config);
    }

    if (res.status !== 201) {
      const error = await res.text();
      throw new Error(
        `Couldn't publish block(s), Error: ${res.status}, ${
          error.match('## Connection details') ? 'Something went wrong' : error
        }`,
      );
    }

    return true;
  });
};

const createAndPublishFiles = async (
  config: Config,
  functions: string[],
  zip: string,
): Promise<void> => {
  const functionsDir = path.join(workingDir, 'functions');
  const funcDefinitions = functionDefinitions(functionsDir);
  const blockFunctions = whitelistedFunctions(funcDefinitions, functions);
  const functionsJson = stringifyDefinitions(blockFunctions);

  await uploadBlock(zip, functionsJson, config);
};

const publishBlocks = async (
  functions: string[],
  zip: string,
): Promise<void> => {
  const config = new Config();
  console.log(chalk.bold(`\nPublishing to ${config.host} (${config.zone})`));
  await createAndPublishFiles(config, functions, zip);
  console.log(
    chalk.green.underline(`✔ Your blocks are published to the block store.`),
  );
};

export default publishBlocks;
