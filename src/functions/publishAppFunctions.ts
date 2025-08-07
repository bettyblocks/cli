/* npm dependencies */

import chalk from 'chalk';
import FormData from 'form-data';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import path from 'path';

/* internal dependencies */
import FusionAuth from '../utils/login';
import Config from './config';
import {
  functionDefinitions,
  stringifyDefinitions,
  zipFunctionDefinitions,
} from './functionDefinitions';

/* execute command */

const workingDir = process.cwd();

interface FunctionResult {
  name: string;
  version?: string;
  status: 'ok' | 'error';
  id?: string;
  error?: string;
}

interface PublishResponse {
  created: FunctionResult[];
  updated: FunctionResult[];
  deleted: FunctionResult[];
  compiled: boolean;
  message?: string;
}

interface PublishOptions {
  skipCompile: boolean;
}

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
    agent: config.agent,
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${fusionAuth.jwt()}`,
    },
  }).then(async (res) => {
    switch (res.status) {
      case 401:
      case 403: {
        await fusionAuth.ensureLogin();
        return uploadAppFunctions(
          functionDefinitionsFile,
          functionsJson,
          config,
        );
      }
      case 201: {
        const { created, updated, deleted, compiled } =
          (await res.json()) as PublishResponse;

        created.forEach((result) => logResult(result, 'Create:'));
        updated.forEach((result) => logResult(result, 'Update:'));
        deleted.forEach((result) => logResult(result, 'Delete:'));

        if (!config.skipCompile) {
          const compiledStatus = compiled ? 'ok' : 'error';
          logResult(
            { status: compiledStatus, name: 'triggered' },
            'Compilation',
          );
        }

        return {
          success: true,
          message: 'Your functions are published to your application.',
        };
      }
      case 409: {
        const { created, updated, deleted, message } =
          (await res.json()) as PublishResponse;

        created.forEach((result) => logResult(result, 'Create:'));
        updated.forEach((result) => logResult(result, 'Update:'));
        deleted.forEach((result) => logResult(result, 'Delete:'));

        return {
          success: false,
          message: message || '409 Conflict',
        };
      }

      default:
        throw new Error(
          `Couldn't publish functions, Error: ${
            res.status
          },${await res.text()}`,
        );
    }
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
