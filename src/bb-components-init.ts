/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { copy, existsSync, move } from 'fs-extra';
import { prompt } from 'inquirer';
import path from 'path';
import { parse, stringify } from 'yaml';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const VALID_NAME_PATTERN = /[a-z0-9-_]+\/[a-z0-9-_]/;

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

  const {
    name,
    isPublic,
    isPublicConfirmed,
  }: {
    name: string;
    isPublic: boolean;
    isPublicConfirmed: boolean;
  } = await prompt([
    {
      name: 'name',
      message: 'Name',
      prefix:
        'The name of your component set should start with @, followed by your organization id, /, and the name of your set.',
      validate: (name: string): true | string =>
        VALID_NAME_PATTERN.test(name) ||
        'Make sure the name starts with @, followed by your organization id, /, and the name of your set.',
    },
    {
      default: false,
      filter: (raw: string): boolean => raw.toLowerCase() === 'public',
      message: 'Is your component set public?',
      name: 'isPublic',
      type: 'confirm',
    },
    {
      default: false,
      name: 'isPublicConfirmed',
      message:
        'Are you ABSOLUTELY SURE that your component set should be public? Once published as such, it cannot be unpublished.',
      type: 'confirm',
      when: ({ isPublic }): boolean => isPublic,
    },
  ]);

  // Copy assets into place

  const yaml = stringify({
    dependencies: {},
    public: isPublic && isPublicConfirmed,
    name,
    version: '0.1.0',
  });

  console.log(yaml);
  // Write bettyblocks.yaml

  console.log(cwd);
})();
