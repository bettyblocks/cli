import chalk from 'chalk';
import { exec } from 'child_process';
import { mkdir, pathExists, readJson, writeJson } from 'fs-extra';
import { tmpdir } from 'os';
import { lt } from 'semver';
import { promisify } from 'util';

import type { Versions } from '../types';
// eslint-disable-next-line
const { version: versionCLI, name: nameCLI } = require('../../package.json');

const execPromise = promisify(exec);

const TEMP_FOLDER = `${tmpdir()}/bettyblocks`;

const logUpdateAvailable = (
  localVersion: string,
  remoteVersion: string,
  name: string,
): void => {
  if (lt(localVersion, remoteVersion)) {
    console.log(
      `${name} update available from ${chalk.greenBright(
        localVersion,
      )} to ${chalk.greenBright(remoteVersion)}`,
    );
  }
};

const getRemoteVersionCLI = async (): Promise<string> => {
  const { stdout: output, stderr: error } = await execPromise(
    `npm show @betty-blocks/cli version`,
  );
  const remoteVersionCLI = output.toString().trim();

  if (error) {
    throw new Error(error);
  }

  return remoteVersionCLI;
};

const writeToFile = async (): Promise<void> => {
  const remoteVersionCLI = await getRemoteVersionCLI();

  await writeJson(`${TEMP_FOLDER}/versions.json`, {
    timestamp: Date.now(),
    versions: {
      remoteVersionCLI,
    },
  });
};

const readFile = async (): Promise<Versions> => {
  const folderExist = await pathExists(TEMP_FOLDER);
  let remoteVersion;

  if (!folderExist) {
    await mkdir(TEMP_FOLDER);
  }

  const fileExist = await pathExists(`${TEMP_FOLDER}/versions.json`);

  if (fileExist) {
    const { versions, timestamp }: { versions: Versions; timestamp: number } =
      (await readJson(`${TEMP_FOLDER}/versions.json`)) as {
        versions: Versions;
        timestamp: number;
      };

    if (timestamp + 86400000 < Date.now()) {
      console.log('Checking for new versions..');
      await writeToFile();
      remoteVersion = await readFile();
      console.log('Done');
    }

    remoteVersion = versions;
  } else {
    await writeToFile();
    remoteVersion = await readFile();
  }

  return remoteVersion;
};

export const checkUpdateAvailableCLI = async (): Promise<void> => {
  try {
    const { remoteVersionCLI } = await readFile();

    logUpdateAvailable(versionCLI, remoteVersionCLI, nameCLI);
  } catch {
    console.error('Unable to check for a new version');
  }
};
