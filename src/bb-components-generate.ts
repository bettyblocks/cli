/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { outputFile, pathExists } from 'fs-extra';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

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
  name: '${name}',
  icon: 'TitleIcon',
  category: 'CONTENT',
  structure: [
    {
      name: '${name}',
      options: [],
      descendants: [],
    },
  ],
}))();
  `;

  const component = `
(() => ({
  name: '${name}',
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
