/* eslint-disable camelcase */
/* npm dependencies */

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import fetch from 'node-fetch';
import FormData from 'form-data';

/* internal dependencies */

import FusionAuth from '../utils/login';
import {
  functionDefinitions,
  stringifyDefinitions,
  zipFunctionDefinitions,
} from './functionDefinitions';

import Config from './config';

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
  deleted: FunctionResult[];
};

const logResult = (
  { status, name, error }: FunctionResult,
  operation: string,
): void => {
  if (status === 'ok') {
    console.log(`${chalk.green(`✔`)} ${operation} ${name}.`);
  } else {
    console.log(
      `${chalk.red(`✖`)} ${operation} ${name} failed. Errors: ${JSON.stringify(
        error,
      )}.`,
    );
  }
};

const uploadAppFunctions = async (
  functionDefinitionsFile: string,
  functionsJson: string,
  config: Config,
): Promise<boolean> => {
  const fusionAuth = new FusionAuth(config);

  const form = new FormData();
  form.append('functions', functionsJson);
  form.append('file', fs.createReadStream(functionDefinitionsFile));

  const applicationId = await config.applicationId();
  if (!applicationId) {
    throw new Error(
      "Couldn't publish functions, Error: application id not found",
    );
  }
  const url = `${config.builderApiUrl}/artifacts/actions/${applicationId}/functions`;
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
      return uploadAppFunctions(functionDefinitionsFile, functionsJson, config);
    }
    if (res.status !== 201) {
      throw new Error(
        `Couldn't publish functions, Error: ${res.status},${await res.text()}`,
      );
    }

    const { created, updated, deleted } = (await res.json()) as PublishResponse;

    created.forEach((result) => logResult(result, 'Create'));
    updated.forEach((result) => logResult(result, 'Update'));
    deleted.forEach((result) => logResult(result, 'Delete'));

    return true;
  });
};

const publishFunctions = async (config: Config): Promise<void> => {
  const functionsDir = path.join(workingDir, 'functions');
  const zipFile = zipFunctionDefinitions(functionsDir);

  const functions = functionDefinitions(functionsDir);
  const functionsJson = stringifyDefinitions(functions);

  await uploadAppFunctions(zipFile, functionsJson, config);
};

const publishAppFunctions = async (): Promise<void> => {
  const config = new Config();
  console.log(`Publishing to ${config.host} (${config.zone}) ...`);
  await publishFunctions(config);
  console.log('Done.');
};

export default publishAppFunctions;
