import { camel } from 'case';
import chalk from 'chalk';
import fs from 'fs-extra';
import fetch, { fileFromSync, FormData } from 'node-fetch';
import path from 'path';

import FusionAuth from '../utils/login';
import Config from './config';

export const publishWasmBlockStoreFunctions = async (
  functionsPath: string,
  functionPaths: string[],
): Promise<void> => {
  const config = new Config();

  for (const functionPath of functionPaths) {
    await publishWasmFunction(functionsPath, functionPath, config);
  }
};

const publishWasmFunction = async (
  functionsPath: string,
  functionPath: string,
  config: Config,
): Promise<void> => {
  const functionDir = path.join(functionsPath, functionPath);
  const wasmFile = getWasmFileFromDir(functionDir);
  if (!wasmFile) {
    console.log(
      chalk.yellow(`! No .wasm file found in ${functionDir}, skipping...`),
    );
    return;
  }
  const functionJson = getFunctionJsonFromDir(functionDir);

  if (!functionJson) {
    console.log(
      chalk.yellow(
        `! No function.json file found in ${functionDir}, skipping...`,
      ),
    );
    return;
  }

  const blockName = path.basename(path.dirname(functionPath));

  await uploadBlock({
    blockName,
    config,
    file: wasmFile,
    functionJson,
  });

  console.log(chalk.green.underline(`✔ Published ${functionPath}`));
};

const getWasmFileFromDir = (functionDir: string): File | null => {
  const files = fs.readdirSync(functionDir);
  for (const file of files) {
    if (file.endsWith('.wasm')) {
      return fileFromSync(path.join(functionDir, file));
    }
  }
  return null;
};

const getFunctionJsonFromDir = (functionDir: string): string | null => {
  const functionJsonPath = path.join(functionDir, 'function.json');
  if (fs.existsSync(functionJsonPath)) {
    const version = path.basename(functionDir);
    const name = camel(path.basename(path.dirname(functionDir)));
    const json = {
      ...fs.readJsonSync(functionJsonPath),
      name,
      version,
    };
    return stringifyDefinition(json);
  }
  return null;
};

const stringifyDefinition = (definition: Record<string, unknown>): string => {
  const updatedDefinition = {
    ...definition,
    options: JSON.stringify(definition.options ?? []),
    paths: JSON.stringify(definition.paths ?? {}),
  };
  return JSON.stringify([updatedDefinition]);
};

interface UploadBlockProps {
  file: File;
  functionJson: string;
  blockName: string;
  config: Config;
}

const uploadBlock = async ({
  file,
  functionJson,
  blockName,
  config,
}: UploadBlockProps): Promise<boolean> => {
  const fusionAuth = new FusionAuth(config);
  const { blockstoreApiUrl, agent } = config;

  const applicationId = await config.applicationId();
  if (!applicationId) {
    throw new Error(
      "Couldn't publish block(s), Error: application id not found",
    );
  }

  const form = new FormData();
  form.append('name', blockName);
  form.append('file', file);
  form.append('functions', functionJson);

  const url = `${blockstoreApiUrl}/blocks/publish?type=wasm-function`;

  return fetch(url, {
    agent,
    body: form,
    headers: {
      Accept: 'application/json',
      ApplicationId: applicationId,
      Authorization: `Bearer ${fusionAuth.jwt()}`,
    },
    method: 'POST',
  }).then(async (res) => {
    if (
      (res.status === 401 || res.status === 403) &&
      applicationId != 'native'
    ) {
      await fusionAuth.ensureLogin();
      return uploadBlock({ blockName, config, file, functionJson });
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
