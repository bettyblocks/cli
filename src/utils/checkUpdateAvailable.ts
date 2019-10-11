import chalk from 'chalk';
import semver from 'semver';
import fetch, { Response } from 'node-fetch';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: localVersion, name } = require('../../package.json');

const logAvailableUpdate: (upstreamVersion: string) => void = (
  upstreamVersion: string,
): void => {
  console.log(
    `${name} update available from ${chalk.greenBright(
      localVersion,
    )} to ${chalk.greenBright(upstreamVersion)}.`,
  );
};

export default async (): Promise<void> => {
  let res: Response;

  try {
    res = await fetch(
      'https://api.github.com/repos/bettyblocks/cli/releases/latest',
    );
  } catch {
    return;
  }

  const { tag_name: tagName } = await res.json();

  if (!tagName) {
    return;
  }

  const upstreamVersion: string = tagName.substring(1);

  if (semver.lt(localVersion, upstreamVersion)) {
    logAvailableUpdate(upstreamVersion);
  }
};
