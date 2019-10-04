import chalk from 'chalk';
import semver from 'semver';
import fetch from 'node-fetch';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version, name } = require('../../package.json');

export default async (): Promise<void> => {
  try {
    const res = await fetch(
      'https://api.github.com/repos/bettyblocks/cli/releases/latest',
    );
    const data = await res.json();
    const upstreamVersion = data.tag_name.substring(1);

    if (semver.lt(version, upstreamVersion)) {
      console.log(
        `${name} update available from ${chalk.greenBright(
          version,
        )} to ${chalk.greenBright(upstreamVersion)}.`,
      );
    }
  } catch {}
};
