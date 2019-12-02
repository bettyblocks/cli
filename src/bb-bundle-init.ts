/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import { existsSync, copy, moveSync } from 'fs-extra';
import path from 'path';

/* internal dependencies */

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
    `Could not initialize bundle: directory (${dest}) already exists.`,
  );
}

(async (): Promise<void> => {
  try {
    await copy(path.join(__dirname, '../assets/bundle'), dest);
    moveSync(`${dest}/__package.json`, `${dest}/package.json`);
    console.log(`Bundle succesfully initialized in directory '${dest}'.`);
  } catch ({ message }) {
    throw Error(
      `Could not initialize bundle in directory ${dest}: ${message}.`,
    );
  }
})();
