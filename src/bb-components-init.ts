/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { F_OK } from 'constants';
import { promises } from 'fs';
import { copy } from 'fs-extra';
import { Answers } from 'inquirer';
import { join } from 'path';
import { stringify } from 'yaml';

/* internal dependencies */
import getFiles, { FILE_NAMES } from './bb-components-init/assets';
import prompt from './bb-components-init/prompt';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const { access, writeFile } = promises;

const CWD = process.cwd();

const YAML_PATH = join(CWD, 'bettyblocks.yaml');

const WARNING_EXISTING_SET =
  'The current working directory already contains a component set.';

const INFO_SUCCESS =
  'Component set succesfully created in the current working directory.';

const warningFailure = (message: string): string =>
  `Could not create component set in the current working directory: ${message}.`;

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
    await access(YAML_PATH);

    console.log(chalk.green(WARNING_EXISTING_SET));
  } catch {
    const { name, isPublic, isPublicConfirmed }: Answers = await prompt();

    const yaml = stringify({
      dependencies: {},
      name,
      public: isPublic && isPublicConfirmed,
      version: '0.1.0',
    });

    try {
      await writeFile(YAML_PATH, yaml, { encoding: 'utf-8' });

      const files = await getFiles();

      await Promise.all(
        FILE_NAMES.map(
          async (fileName: string): Promise<void> => {
            const { dest, src } = files[fileName];

            try {
              await access(dest, F_OK);
            } catch (e) {
              await copy(src, dest);
            }
          },
        ),
      );

      console.log(chalk.green(INFO_SUCCESS));
    } catch ({ message }) {
      throw Error(chalk.red(warningFailure(message)));
    }
  }
})();
