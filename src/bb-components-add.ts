/* npm dependencies */

import YAML from 'yaml';
import chalk from 'chalk';
import got from 'got';
import program, { CommanderStatic } from 'commander';
import { readFile, writeFile } from 'fs-extra';

import getRootDir from './utils/getRootDir';
import { Registry } from './types';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import { install } from './registry';

const REGISTRY_URL = 'http://localhost:3030';

/* process arguments */

program
  .usage('{@<organization}/{component-set}>')
  .name('bb components add')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const [set] = args;

const getVersions = async (setName: string): Promise<Registry> => {
  try {
    const { body } = await got(`${REGISTRY_URL}/api/blocks/${setName}`, {
      responseType: 'json',
    });

    return body;
  } catch (error) {
    const statusCode = error?.response?.statusCode;

    if (statusCode === 404) {
      throw new ReferenceError('404: component set not found');
    }

    if (statusCode === 500) {
      throw new Error('500: something went wrong on our end :(');
    }

    throw error;
  }
};

(async (): Promise<void> => {
  try {
    await checkUpdateAvailableCLI();

    const {
      data: [entry],
    } = await getVersions(set);

    const rootDir = await getRootDir();

    await install(entry, rootDir);

    const contents = await readFile(`${rootDir}/bettyblocks.yaml`);
    const yaml = YAML.parse(contents.toString());

    yaml.dependencies[set] = entry.version;

    await writeFile(`${rootDir}/bettyblocks.yaml`, YAML.stringify(yaml));
  } catch ({ message }) {
    console.log(chalk.red(message));
    process.exit(1);
  }
})();
