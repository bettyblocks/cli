/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { copy, existsSync, move } from 'fs-extra';
import path from 'path';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const DOT_FILES = [
  'package.json',
  '.eslintignore',
  '.eslintrc.json',
  '.gitignore',
  '.prettierignore',
  '.prettierrc.json',
];

/* process arguments */

program
  .usage('[path]')
  .name('bb components create')
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
      `\nCould not create component set: directory (${dest}) already exists.\n`,
    ),
  );
}

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  try {
    await copy(path.join(__dirname, '../assets/component-set'), dest);

    Promise.all(
      DOT_FILES.map(fileName =>
        move(`${dest}/__${fileName}`, `${dest}/${fileName}`),
      ),
    );

    console.log(
      chalk.green(
        `\nComponent set succesfully created in directory '${dest}'.\n`,
      ),
    );
  } catch ({ message }) {
    throw Error(
      chalk.red(
        `\nCould not create component set in directory ${dest}: ${message}.\n`,
      ),
    );
  }
})();
