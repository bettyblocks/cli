import chalk from 'chalk';
import { exec } from 'child_process';
import { mkdir, pathExists, readJson, writeJson } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { lt } from 'semver';
import { promisify } from 'util';

import { Versions } from '../types';

const ONE_DAY = 86400000;
const TEMP_FOLDER = `${tmpdir()}/bettyblocks`;

// eslint-disable-next-line
const { version: versionCLI, name: nameCLI } = require('../../package.json');

const execPromise = promisify(exec);

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
    throw error;
  }

  return remoteVersionCLI;
};

const getRemoteVersionPreview = async (): Promise<string> => {
  const { stdout: output, stderr: error } = await execPromise(
    `npm show @betty-blocks/preview version`,
  );

  const remoteVersionPreview = output.toString().trim();

  if (error) {
    throw error;
  }

  return remoteVersionPreview;
};

const writeToFile = async (): Promise<void> => {
  const remoteVersionCLI = await getRemoteVersionCLI();
  const remoteVersionPreview = await getRemoteVersionPreview();

  await writeJson(`${TEMP_FOLDER}/versions.json`, {
    versions: {
      remoteVersionCLI,
      remoteVersionPreview,
    },
    timestamp: Date.now(),
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
    const { versions, timestamp } = await readJson(
      `${TEMP_FOLDER}/versions.json`,
    );

    if (timestamp + ONE_DAY < Date.now()) {
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

export const checkUpdateAvailablePreview = async (
  path: string,
): Promise<void> => {
  const previewPkg = join(path, '../package.json');

  try {
    const { version: localVersion, name } = await readJson(previewPkg);
    const { remoteVersionPreview, remoteVersionCLI } = await readFile();

    logUpdateAvailable(versionCLI, remoteVersionCLI, nameCLI);
    logUpdateAvailable(localVersion, remoteVersionPreview, name);
  } catch {
    console.error('Unable to check for a new version');
  }
};
