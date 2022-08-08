/* eslint-disable camelcase */
/* npm dependencies */

import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import FormData from 'form-data';

/* internal dependencies */

import { logResult } from 'src/functions/publishAppFunctions';
import {
  functionDefinitions,
  stringifyDefinitions,
  whitelistedFunctions,
} from '../functions/functionDefinitions';
import FusionAuth from '../utils/login';

import Config from '../functions/config';

/* execute command */

const workingDir = process.cwd();

type FunctionResult = {
  name: string;
  status: 'ok' | 'error';
  id?: string;
  error?: string;
};

type PublishResponse = {
  created: FunctionResult[];
  updated: FunctionResult[];
};

const uploadBlock = async (
  blockDefinitionsFile: string,
  functionsJson: string,
  config: Config,
): Promise<boolean> => {
  const fusionAuth = new FusionAuth(config);

  const form = new FormData();
  form.append('functions', functionsJson);
  form.append('file', fs.createReadStream(blockDefinitionsFile));

  const applicationId = await config.applicationId();
  if (!applicationId) {
    throw new Error(
      "Couldn't publish block(s), Error: application id not found",
    );
  }
  const url = config.blockstoreApiUrl;

  return fetch(url, {
    method: 'POST',
    body: form,
    headers: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Authorization: `Bearer ${fusionAuth.jwt()}`,
    },
  }).then(async (res) => {
    if (res.status === 401 || res.status === 403) {
      await fusionAuth.ensureLogin();
      return uploadBlock(blockDefinitionsFile, functionsJson, config);
    }
    if (res.status !== 201) {
      throw new Error(
        `Couldn't publish block(s), Error: ${res.status},${await res.text()}`,
      );
    }

    const { created, updated } = (await res.json()) as PublishResponse;

    created.forEach((result) => logResult(result, 'Create'));
    updated.forEach((result) => logResult(result, 'Update'));

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
  console.log(`Publishing to ${config.host} (${config.zone})`);
  await createAndPublishFiles(config, functions, zip);
  console.log('Done.');
};

export default publishBlocks;
