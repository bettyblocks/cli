/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { readFile, remove, writeFile } from 'fs-extra';
import YAML from 'yaml';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import getRootDir from './utils/getRootDir';

/* process arguments */

program
  .usage('{@<organization}/{component-set}>')
  .name('bb components remove')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const [set] = args;

(async (): Promise<void> => {
  try {
    await checkUpdateAvailableCLI();

    const rootDir = await getRootDir();

    await remove(`${rootDir}/betty_blocks/${set}`);

    const contents = await readFile(`${rootDir}/bettyblocks.yaml`);
    const yaml = YAML.parse(contents.toString());

    delete yaml.dependencies[set];

    await writeFile(`${rootDir}/bettyblocks.yaml`, YAML.stringify(yaml));

    console.info(chalk.green(`Removed ${set}.`));
  } catch ({ message }) {
    console.log(chalk.red(message));
    process.exit(1);
  }
})();
