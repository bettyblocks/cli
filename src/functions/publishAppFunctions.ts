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
  version?: string;
  status: 'ok' | 'error';
  id?: string;
  error?: string;
};

type PublishResponse = {
  created: FunctionResult[];
  updated: FunctionResult[];
  deleted: FunctionResult[];
  compiled: boolean;
  message?: string;
};

type PublishOptions = {
  skipCompile: boolean;
};

export const logResult = (
  { status, name, version, error }: FunctionResult,
  operation: string,
): void => {
  const delimiter = version ? '-' : '';
  if (status === 'ok') {
    console.log(
      `${chalk.green(`✔`)} ${operation} ${name}${delimiter}${version || ''}.`,
    );
  } else {
    console.log(
      `${chalk.red(`✖`)} ${operation} ${name}${delimiter}${
        version || ''
      } failed. Errors: ${JSON.stringify(error)}.`,
    );
  }
};

const uploadAppFunctions = async (
  functionDefinitionsFile: string,
  functionsJson: string,
  config: Config,
): Promise<{ success: boolean; message: string }> => {
  const fusionAuth = new FusionAuth(config);

  const form = new FormData();
  form.append('functions', functionsJson);
  form.append('options', JSON.stringify({ compile: !config.skipCompile }));
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

    if (res.status !== 201 && res.status !== 409) {
      throw new Error(
        `Couldn't publish functions, Error: ${res.status},${await res.text()}`,
      );
    }

    const { created, updated, deleted, compiled, message } =
      (await res.json()) as PublishResponse;

    created.forEach((result) => logResult(result, 'Create:'));
    updated.forEach((result) => logResult(result, 'Update:'));
    deleted.forEach((result) => logResult(result, 'Delete:'));

    if (!config.skipCompile) {
      const compiledStatus = compiled ? 'ok' : 'error';
      logResult({ status: compiledStatus, name: 'triggered' }, 'Compilation');
    }

    return {
      success: res.status === 201,
      message: message || 'Your functions are published to your application.',
    };
  });
};

const publishFunctions = async (config: Config): Promise<void> => {
  const functionsDir = path.join(workingDir, 'functions');
  const zipFile = zipFunctionDefinitions(functionsDir, config.includes);

  const functions = functionDefinitions(functionsDir);
  const functionsJson = stringifyDefinitions(functions);

  const { success, message } = await uploadAppFunctions(
    zipFile,
    functionsJson,
    config,
  );

  if (success) {
    console.log(`\n${chalk.green.underline(`✔ ${message}`)}`);
  } else {
    console.log(`\n${chalk.red.underline(`✖ ${message}`)}`);
  }
};

const publishAppFunctions = async ({
  skipCompile,
}: PublishOptions): Promise<void> => {
  const config = new Config({ skipCompile });

  console.log(chalk.bold(`\nPublishing to ${config.host} (${config.zone})`));
  await publishFunctions(config);
};

export default publishAppFunctions;
