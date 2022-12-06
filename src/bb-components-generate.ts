/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { pathExists, outputFile } from 'fs-extra';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
/* process arguments */

program.usage('[name]').name('bb components generate').parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const name: string = args[0];

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  if (name.includes(' ')) {
    throw new Error(chalk.red(`\nName cannot contain spaces\n`));
  }

  if (await pathExists(`src/prefabs/${name}.tsx`)) {
    throw new Error(chalk.red(`\nPrefab ${name} already exists\n`));
  }

  if (await pathExists(`src/components/${name}.js`)) {
    throw new Error(chalk.red(`\nComponent ${name} already exists\n`));
  }
  const capitalisedName = name.charAt(0).toUpperCase() + name.slice(1);

  const prefab = `
import { prefab, Icon } from '@betty-blocks/component-sdk';

import { ${capitalisedName} } from './structures/${capitalisedName}';

const attributes = {
  category: 'CONTENT',
  icon: Icon.TitleIcon,
  keywords: [''],
};

export default prefab('${capitalisedName}', attributes, undefined, [${capitalisedName}({})]);

`;

  const structureIndex = `
import { component, PrefabReference } from '@betty-blocks/component-sdk';
import { Configuration } from '../Configuration';
import {
  ${name}Options as defaultOptions,
  categories as defaultCategories,
} from './options';

export const ${capitalisedName} = (
  config: Configuration,
  descendants: PrefabReference[] = [],
) => {
  const options = { ...(config.options || defaultOptions) };
  const style = { ...config.style };
  const ref = config.ref ? { ...config.ref } : undefined;
  const label = config.label ? config.label : undefined;
  const optionCategories = config.optionCategories
    ? { ...config.optionCategories }
    : defaultCategories;

  return component(
    '${capitalisedName}',
    { options, ref, style, label, optionCategories },
    descendants,
  );
};

`;

  const optionsIndex = `
import { variable } from '@betty-blocks/component-sdk';
import { advanced } from '../../advanced';

export const categories = [
  {
    label: 'Advanced Options',
    expanded: false,
    members: ['dataComponentAttribute'],
  },
];

export const ${name}Options = {
  content: variable('Content', {
    value: ['Hello world'],
    configuration: { as: 'MULTILINE' },
  }),

  ...advanced('${capitalisedName}'),
};

`;

  const component = `
(() => ({
  name: '${capitalisedName}',
  type: 'CONTENT_COMPONENT',
  allowedTypes: [],
  orientation: 'HORIZONTAL',
  jsx: (() => {
    const { useText } = B;
    const { content } = options;
    return <div className={classes.root}>{useText(content)}</div>;
  })(),
  styles: () => () => ({
    root: {},
  }),
}))();

`;

  await Promise.all([
    outputFile(
      `src/prefabs/structures/${capitalisedName}/index.ts`,
      structureIndex.trim(),
    ),
    outputFile(
      `src/prefabs/structures/${capitalisedName}/options/index.ts`,
      optionsIndex.trim(),
    ),
    outputFile(`src/prefabs/${name}.tsx`, prefab.trim()),
    outputFile(`src/components/${name}.js`, component.trim()),
    console.log(chalk.green('The component has been generated')),
  ]);
})();
