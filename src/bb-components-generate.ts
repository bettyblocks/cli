/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { outputFile, pathExists, readFile } from 'fs-extra';
import YAML from 'yaml';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import getRootDir from './utils/getRootDir';

/* process arguments */

program
  .usage('[name]')
  .name('bb components generate')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const name: string = args[0];

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  const rootDir = await getRootDir();
  const yaml = await readFile(`${rootDir}/bettyblocks.yaml`, 'utf-8');
  const { name: packageName } = YAML.parse(yaml);

  const FULL_NAME = `'${packageName}/${name}'`;

  if (name.includes(' ')) {
    throw new Error(chalk.red(`\nName cannot contain spaces\n`));
  }

  if (await pathExists(`src/prefabs/${name}.js`)) {
    throw new Error(chalk.red(`\nPrefab ${name} already exists\n`));
  }

  if (await pathExists(`src/components/${name}.js`)) {
    throw new Error(chalk.red(`\nComponent ${name} already exists\n`));
  }

  const prefab = `
(() => ({
  name: ${FULL_NAME},
  icon: 'TitleIcon',
  category: 'CONTENT',
  structure: [
    {
      name: ${FULL_NAME},
      options: [],
      descendants: [],
    },
  ],
}))();
  `;

  const component = `
(() => ({
  name: ${FULL_NAME},
  type: 'ROW',
  allowedTypes: [],
  orientation: 'HORIZONTAL',
  jsx: <div className={classes.root}>Hello World</div>,
  styles: () => () => ({
    root: {},
  }),
}))();
  `;

  await Promise.all([
    outputFile(`src/prefabs/${name}.js`, prefab.trim()),
    outputFile(`src/components/${name}.js`, component.trim()),

    console.log(chalk.green('The component has been generated')),
  ]);
})();
