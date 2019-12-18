import { readJson, mkdir, writeJson, pathExists } from 'fs-extra';
import { promisify } from 'util';
import { exec } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { lt } from 'semver';
import chalk from 'chalk';

import { Versions } from '../types';
// eslint-disable-next-line
const { version: versionCli } = require('../../package.json');

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

const getRemoteVersionCli = async (): Promise<string> => {
  const { stdout: output, stderr: error } = await execPromise(
    `npm show @betty-blocks/cli version`,
  );
  const remoteVersionCli = output.toString().trim();

  if (error) {
    throw new Error('Cannot check for the newest version at this time');
  }

  return remoteVersionCli;
};

const getRemoteVersionPreview = async (): Promise<string> => {
  const { stdout: output, stderr: error } = await execPromise(
    `npm show @betty-blocks/preview version`,
  );
  const remoteVersionPreview = output.toString().trim();

  if (error) {
    throw new Error('Cannot check for the newest version at this time');
  }

  return remoteVersionPreview;
};

const writeToFile = async (): Promise<void> => {
  const remoteVersionCli = await getRemoteVersionCli();
  const remoteVersionPreview = await getRemoteVersionPreview();

  await writeJson(`${TEMP_FOLDER}/versions.json`, {
    versions: {
      remoteVersionCli,
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

    if (timestamp + 86400000 < Date.now()) {
      console.log('Checking for new versions..');
      await writeToFile();
      remoteVersion = await readFile();
      console.log('Done..');
    }

    remoteVersion = versions;
  } else {
    await writeToFile();
    remoteVersion = await readFile();
  }

  return remoteVersion;
};

export const checkUpdateAvailableCli = async (): Promise<void> => {
  try {
    const { remoteVersionCli } = await readFile();

    logUpdateAvailable(versionCli, remoteVersionCli, 'CLI');
  } catch (error) {
    throw new Error(error);
  }
};

export const checkUpdateAvailablePreview = async (
  path: string,
): Promise<void> => {
  const previewPkg = join(path, '../package.json');

  try {
    const { version: localVersion, name } = await readJson(previewPkg);
    const { remoteVersionPreview } = await readFile();

    logUpdateAvailable(localVersion, remoteVersionPreview, name);
  } catch (error) {
    throw new Error(error);
  }
};
