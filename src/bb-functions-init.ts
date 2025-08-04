import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { Command } from 'commander';

import rootDir from './utils/rootDir';

const program = new Command();

program
  .usage('[identifier]')
  .name('bb functions init')
  .option('-a, --app', 'Initialize an app functions project.')
  .parse(process.argv);

const initAppFunctions = program.opts().app;
const { args } = program;

if (args.length !== 1) {
  console.log(
    chalk.red('Please provide the identifier (subdomain) of your application.'),
  );
  process.exit();
}

/* execute command */

const identifier = args[0];
const workingDir = process.cwd();
const targetDir = path.join(workingDir, identifier);

fs.access(targetDir, fs.constants.F_OK, (err: NodeJS.ErrnoException | null) => {
  if (err && err.code === 'ENOENT') {
    let type;
    let actions;
    let commands;
    let sourceDir;

    if (initAppFunctions) {
      type = 'app functions';
      actions = 'publish';
      commands = '';
      sourceDir = path.join(rootDir(), 'assets', 'app-functions', 'templates');
      fs.copySync(sourceDir, targetDir);
    } else {
      type = 'functions';
      actions = 'build and/or publish';
      commands = 'bb functions build\n    ';
      sourceDir = path.join(rootDir(), 'assets', 'functions', 'templates');
      fs.copySync(sourceDir, targetDir);
      fs.copySync(
        path.join(
          rootDir(),
          'assets',
          'functions',
          'packer',
          'webpack.config.js',
        ),
        path.join(targetDir, 'webpack.config.js'),
      );
    }

    console.log(`Initialized ${type} project in ${targetDir}.
You can use "bb functions" to ${actions} it:

    cd ${identifier}
    ${commands}bb functions publish
`);
  } else {
    console.log(`The directory "${targetDir}" already exists. Abort.`);
  }
});
