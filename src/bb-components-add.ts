/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { readFile, writeFile } from 'fs-extra';
import got from 'got';
import YAML from 'yaml';

import { exists, install } from './registry';
import { RegistryEntry } from './types';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import getRootDir from './utils/getRootDir';

const REGISTRY_URL = 'https://blocks-registry.betty.services';

/* process arguments */

program
  .usage('{@<organization}/{component-set}>')
  .name('bb components add')
  .option(
    '--registry [url]',
    'Use a custom registry. Defaults to the Betty Blocks registry.',
  )
  .parse(process.argv);

const { registry, args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const [set] = args;

const getLatest = async (setName: string): Promise<RegistryEntry> => {
  try {
    const {
      body: {
        data: [entry],
      },
    } = await got(`${registry || REGISTRY_URL}/api/blocks/${setName}`, {
      responseType: 'json',
    });

    return entry;
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

    const [name, version] = set.split(':');

    const entry = await (typeof version === 'string'
      ? exists(registry || REGISTRY_URL, { name, version })
      : getLatest(set));

    const rootDir = await getRootDir();

    await install(registry || REGISTRY_URL, entry, rootDir);

    const contents = await readFile(`${rootDir}/bettyblocks.yaml`);
    const yaml = YAML.parse(contents.toString());

    yaml.dependencies[name] = entry.version;

    await writeFile(`${rootDir}/bettyblocks.yaml`, YAML.stringify(yaml));

    console.info(chalk.green(`Added ${name}:${entry.version}.`));
  } catch ({ message }) {
    console.log(chalk.red(message));
    process.exit(1);
  }
})();
