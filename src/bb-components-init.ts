/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { promises } from 'fs';
import { copy, move } from 'fs-extra';
import { prompt } from 'inquirer';
import { join } from 'path';
import { stringify } from 'yaml';

/* internal dependencies */
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const { readdir, stat, writeFile } = promises;

const CWD = process.cwd();

const VALID_NAME_PATTERN = /[a-z0-9-_]+\/[a-z0-9-_]/;

const ASSET_PATH = join(__dirname, '../assets/component-set');
const YAML_PATH = join(CWD, 'bettyblocks.yaml');
const SRC_PATH = join(CWD, 'src');

/* process arguments */

program.name('bb components init').parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length > 0) {
  program.help();
}

/* execute command */

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  try {
    await stat(YAML_PATH);

    console.log(
      chalk.green(
        `\nThe current working directory already contains a component set.\n`,
      ),
    );
  } catch {
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
        validate: (nameValue: string): true | string =>
          VALID_NAME_PATTERN.test(nameValue) ||
          'Make sure the name starts with @, followed by your organization id, /, and the name of your set. For example: @betty-blocks/layout',
      },
      {
        default: false,
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
        when: ({ isPublic: isPublicValue }): boolean => isPublicValue,
      },
    ]);

    const yaml = stringify({
      dependencies: {},
      name,
      public: isPublic && isPublicConfirmed,
      version: '0.1.0',
    });

    try {
      await writeFile(YAML_PATH, yaml, { encoding: 'utf-8' });
      await copy(ASSET_PATH, CWD, { overwrite: false });

      const filesCWD = await readdir(CWD);

      await Promise.all(
        filesCWD
          .filter((file: string): boolean => file.startsWith('__'))
          .map(
            (file: string): Promise<void> =>
              move(join(CWD, file), join(CWD, file.replace('__', ''))),
          ),
      );

      console.log(
        chalk.green(
          `\nComponent set succesfully created in the current working directory.\n`,
        ),
      );
    } catch ({ message }) {
      throw Error(
        chalk.red(
          `\nCould not create component set in the current working directory: ${message}.\n`,
        ),
      );
    }
  }
})();
