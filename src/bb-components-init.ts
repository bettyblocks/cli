/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { promises } from 'fs';
import { copy } from 'fs-extra';
import { prompt } from 'inquirer';
import path, { join } from 'path';
import { stringify } from 'yaml';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const { writeFile } = promises;

const VALID_NAME_PATTERN = /[a-z0-9-_]+\/[a-z0-9-_]/;

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
  const dest = join(cwd, 'bettyblocks');

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
        'Make sure the name starts with @, followed by your organization id, /, and the name of your set. For example: @betty-blocks/layout',
    },
    {
      default: false,
      filter: (raw: string): boolean => raw.toLowerCase() === 'public',
      message: 'Is this component set public?',
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

  const yaml = stringify({
    dependencies: {},
    name,
    public: isPublic && isPublicConfirmed,
    version: '0.1.0',
  });

  try {
    await Promise.all([
      copy(path.join(__dirname, '../assets/component-set'), dest),
      copy(path.join(__dirname, '../assets/component-set/.*'), dest),
      writeFile(`${cwd}/bettyblocks.yaml`, yaml, { encoding: 'utf-8' }),
    ]);

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
