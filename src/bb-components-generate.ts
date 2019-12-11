/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import { pathExists, outputFile } from 'fs-extra';

/* internal dependencies */

import checkUpdateAvailable from './utils/checkUpdateAvailable';

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
  await checkUpdateAvailable();

  if (name.includes(' ')) {
    throw new Error(`Name cannot contain spaces`);
  }

  if (await pathExists(`src/prefabs/${name}.js`)) {
    throw new Error(`Prefab ${name} already exists`);
  }

  if (await pathExists(`src/components/${name}.js`)) {
    throw new Error(`Component ${name} already exists`);
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
  ]);
})();
