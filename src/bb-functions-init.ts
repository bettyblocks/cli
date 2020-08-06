/* npm dependencies */

import fs from 'fs-extra';
import path from 'path';
import program, { CommanderStatic } from 'commander';

/* internal dependencies */

import rootDir from './utils/rootDir';

/* process arguments */

program
  .usage('[identifier]')
  .name('bb functions init')
  .parse(process.argv);

const { args }: CommanderStatic = program;

/* execute command */

const identifier = args[0];
const workingDir = process.cwd();
const targetDir = path.join(workingDir, identifier);

fs.access(targetDir, fs.constants.F_OK, (err: NodeJS.ErrnoException | null) => {
  if (err && err.code === 'ENOENT') {
    const sourceDir = path.join(rootDir(), 'assets', 'functions', 'templates');
    fs.copySync(sourceDir, targetDir);

    console.log(`Initialized functions project in ${targetDir}.
You can use "bb functions" to build it, test it, and more:

    cd ${identifier}
    bb functions test
`);
  } else {
    console.log(`The directory "${targetDir}" already exists. Abort.`);
  }
});
