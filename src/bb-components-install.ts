/* npm dependencies */

import YAML from 'yaml';
import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { readFile } from 'fs-extra';

import { exists, install } from './registry';
import getRootDir from './utils/getRootDir';

const REGISTRY_URL = 'https://blocks-registry.betty.services';

program
  .name('bb components install')
  .option(
    '--registry [url]',
    'Use a custom registry. Defaults to the Betty Blocks registry.',
  )
  .parse(process.argv);

const { registry }: CommanderStatic = program;

(async (): Promise<void> => {
  try {
    const rootDir = await getRootDir();
    const contents = await readFile(`${rootDir}/bettyblocks.yaml`);
    const { dependencies } = YAML.parse(contents.toString());
    const names = Object.keys(dependencies);

    await Promise.all(
      names.map(
        async (name: string): Promise<void> => {
          const version = dependencies[name];

          try {
            await exists(registry || REGISTRY_URL, { name, version });
          } catch (error) {
            console.log(chalk.red(`${name}-${version} not found`));
            throw error;
          }
        },
      ),
    );

    await Promise.all(
      names.map(
        async (name: string): Promise<void> => {
          const version = dependencies[name];

          await install(registry || REGISTRY_URL, { name, version }, rootDir);

          console.log(chalk.blue(`${name}-${version}`));
        },
      ),
    );

    const { length } = names;

    console.log(`${length} block${length === 1 ? '' : 's'} installed`);
  } catch ({ name, message }) {
    console.error(chalk.red(`\n${name}: ${message}.\n`));
    process.exit(1);
  }
})();
