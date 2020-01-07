/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { F_OK } from 'constants';
import { promises } from 'fs';
import { copy } from 'fs-extra';
import { prompt } from 'inquirer';
import { join } from 'path';
import { stringify } from 'yaml';

/* internal dependencies */
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

type FileMap = Record<string, { dest: string; src: string }>;

const { access, writeFile } = promises;

const CWD = process.cwd();

const VALID_NAME_PATTERN = /[a-z0-8-_]+\/[a-z0-9-_]/;

const ASSET_PATH = join(__dirname, '../assets/component-set');

const DOT_FILE_NAMES = [
  '.eslintignore',
  '.eslintrc.json',
  '.gitignore',
  '.prettierignore',
  '.prettierrc.json',
];

const REGULAR_FILE_NAMES = ['package.json', 'README.md'];

const FILE_NAMES = [...REGULAR_FILE_NAMES, ...DOT_FILE_NAMES];

const YAML_PATH = join(CWD, 'bettyblocks.yaml');

const QUESTION_NAME_PREFIX =
  'The name of your component set should start with @, followed by your organization id, /, and the name of your set.';

const QUESTION_NAME_VALIDATION =
  'Make sure the name starts with @, followed by your organization id, /, and the name of your set. For example: @betty-blocks/layout';

const QUESTION_PUBLIC_MESSAGE = 'Is this component set public?';

const QUESTION_PUBLIC_CONFIRM =
  'Are you ABSOLUTELY SURE that your component set should be public? Once published as such, it cannot be unpublished.';

const WARNING_EXISTING_SET =
  'The current working directory already contains a component set.';

const INFO_SUCCESS =
  'Component set succesfully created in the current working directory.';

const warningFailure = (message: string): string =>
  `Could not create component set in the current working directory: ${message}.`;

const dotFiles = DOT_FILE_NAMES.reduce(
  (mapping: FileMap, name: string): FileMap => ({
    [name]: {
      dest: join(CWD, name),
      src: join(ASSET_PATH, `__${name}`),
    },
    ...mapping,
  }),
  {} as FileMap,
);

const regularFiles = REGULAR_FILE_NAMES.reduce(
  (mapping: FileMap, name: string): FileMap => ({
    [name]: { src: join(ASSET_PATH, name), dest: join(CWD, name) },
    ...mapping,
  }),
  {} as FileMap,
);

const files = { ...regularFiles, ...dotFiles };

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
        prefix: QUESTION_NAME_PREFIX,
        validate: (nameValue: string): true | string =>
          VALID_NAME_PATTERN.test(nameValue) || QUESTION_NAME_VALIDATION,
      },
      {
        default: false,
        message: QUESTION_PUBLIC_MESSAGE,
        name: 'isPublic',
        type: 'confirm',
      },
      {
        default: false,
        name: 'isPublicConfirmed',
        message: QUESTION_PUBLIC_CONFIRM,
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
      await Promise.all([
        writeFile(YAML_PATH, yaml, { encoding: 'utf-8' }),
        ...FILE_NAMES.map(
          async (fileName: string): Promise<void> => {
            const { dest, src } = files[fileName];

            try {
              await access(dest, F_OK);
            } catch (e) {
              await copy(src, dest);
            }
          },
        ),
      ]);

      console.log(chalk.green(INFO_SUCCESS));
    } catch ({ message }) {
      throw Error(chalk.red(warningFailure(message)));
    }
  }
})();
