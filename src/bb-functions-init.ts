import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import rootDir from './utils/rootDir';

const program = new Command();

program.usage('[identifier]').name('bb functions init').parse(process.argv);

const { args } = program;

if (args.length !== 1) {
  console.log(
    chalk.red('Please provide the identifier (subdomain) of your application.'),
  );
  process.exit();
}

const [identifier] = args;
const workingDir = process.cwd();
const targetDir = path.join(workingDir, identifier);

fs.access(targetDir, fs.constants.F_OK, (err: NodeJS.ErrnoException | null) => {
  if (err && err.code === 'ENOENT') {
    const sourceDir = path.join(
      rootDir(),
      'assets',
      'app-functions',
      'templates',
    );
    fs.copySync(sourceDir, targetDir);

    console.log(`Initialized functions project in ${targetDir}.
You can use "bb functions" to publish it:

    cd ${identifier}
    bb functions publish
`);
  } else {
    console.log(`The directory "${targetDir}" already exists. Abort.`);
  }
});
