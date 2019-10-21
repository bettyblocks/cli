/* npm dependencies */

import program, { CommanderStatic } from 'commander';
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
    `Could not create component set: directory (${dest}) already exists.`,
  );
}

(async (): Promise<void> => {
  try {
    await copy(path.join(__dirname, '../assets/component-set'), dest);
    moveSync(`${dest}/__package.json`, `${dest}/package.json`);
    console.log(`Component set succesfully created in directory '${dest}'.`);
  } catch ({ message }) {
    throw Error(
      `Could not create component set in directory ${dest}: ${message}.`,
    );
  }
})();
