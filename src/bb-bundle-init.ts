/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { copy, existsSync, moveSync } from 'fs-extra';
import path from 'path';

/* internal dependencies */
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

/* process arguments */

program
  .usage('[path]')
  .name('bb bundle init')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const dest: string = args[0];

/* execute command */

if (existsSync(dest)) {
  throw Error(
    chalk.red(
      `\nCould not initialize bundle: directory (${dest}) already exists.\n`,
    ),
  );
}

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  try {
    await copy(path.join(__dirname, '../assets/bundle'), dest);

    moveSync(`${dest}/__package.json`, `${dest}/package.json`);

    console.log(
      chalk.green(`Bundle succesfully initialized in directory '${dest}'.`),
    );
  } catch ({ message }) {
    throw Error(
      chalk.red(
        `\nCould not initialize bundle in directory ${dest}: ${message}.\n`,
      ),
    );
  }
})();
