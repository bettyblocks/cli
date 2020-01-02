/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { copy, existsSync, move } from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const files = [
  'package.json',
  '.eslintignore',
  '.eslintrc.json',
  '.gitignore',
  '.prettierignore',
  '.prettierrc.json',
];

/* process arguments */

program.name('bb components init').parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length > 0) {
  program.help();
}

/* execute command */

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  const cwd = process.cwd();

  // Explain name
  // Prompt for name
  // Prompt for scope
  // Copy assets into place
  // Write bettyblocks.yaml

  console.log(cwd);
})();
