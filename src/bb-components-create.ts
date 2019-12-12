/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { existsSync, copy, moveSync } from 'fs-extra';
import path from 'path';

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
  try {
    await copy(path.join(__dirname, '../assets/component-set'), dest);
    moveSync(`${dest}/__package.json`, `${dest}/package.json`);
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
