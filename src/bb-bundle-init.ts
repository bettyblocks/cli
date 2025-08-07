/* npm dependencies */
import chalk from 'chalk';
import { Command } from 'commander';
import { copy, existsSync, moveSync } from 'fs-extra';
import path from 'path';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const program = new Command();

program
  .argument('<path>', 'path where to initialize the bundle')
  .name('bb bundle init')
  .parse(process.argv);

const { args } = program;

if (args.length === 0) {
  program.help();
}

const dest: string = args[0];

if (existsSync(dest)) {
  throw Error(
    chalk.red(
      `\nCould not initialize bundle: directory (${dest}) already exists.\n`,
    ),
  );
}

void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  try {
    await copy(path.join(__dirname, '../assets/bundle'), dest);
    moveSync(`${dest}/__package.json`, `${dest}/package.json`);
    console.log(
      chalk.green(`Bundle succesfully initialized in directory '${dest}'.`),
    );
  } catch (error) {
    if (error instanceof Error) {
      throw Error(
        chalk.red(
          `\nCould not initialize bundle in directory ${dest}: ${error.message}.\n`,
        ),
      );
    }
  }
})();
