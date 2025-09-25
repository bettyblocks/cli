import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import rootDir from './utils/rootDir';

const program = new Command();

program
  .usage('[identifier]')
  .name('bb functions init')
  .option(
    '-t, --type [type]',
    'Specify the type of functions project to initialize. E.g., "wasm" or "js".',
    'js',
  )
  .parse(process.argv);

const { args } = program;
const {
  options: { type },
} = program.opts();

if (args.length !== 1) {
  console.log(
    chalk.red('Please provide the identifier (subdomain) of your application.'),
  );
  process.exit();
}

const [identifier] = args;
const workingDir = process.cwd();
const targetDir = path.join(workingDir, identifier);

if (!fs.existsSync(targetDir)) {
  console.log(`The directory "${targetDir}" already exists. Abort.`);
  process.exit(1);
}

let sourceDir = path.join(rootDir(), 'assets', 'app-functions', 'js-template');
if (type === 'wasm') {
  sourceDir = path.join(rootDir(), 'assets', 'app-functions', 'wasm-template');
}

fs.copySync(sourceDir, targetDir);

console.log(`Initialized functions project in ${targetDir}.
    You can use "bb functions" to publish it:

        cd ${identifier}
        bb functions publish
    `);
