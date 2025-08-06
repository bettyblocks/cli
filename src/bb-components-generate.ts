/* npm dependencies */
import { Command } from 'commander';
import chalk from 'chalk';
import { pathExists, outputFile, outputFileSync } from 'fs-extra';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const program = new Command();

program
  .argument('<name>', 'name of the component')
  .name('bb components generate')
  .parse(process.argv);

const { args } = program;

if (args.length === 0) {
  program.help();
}

const name: string = args[0].charAt(0).toLowerCase() + args[0].slice(1);

const advancedTs = `import { variable } from '@betty-blocks/component-sdk';

export const advanced = (value: string) => {
  return {
    dataComponentAttribute: variable('Test attribute', {
      value: [value],
    }),
  };
};
`;

const configurationTs = `import {
  OptionCategory,
  OptionProducer,
  PrefabComponentStyle,
} from '@betty-blocks/component-sdk';

export interface Configuration {
  options?: Record<string, OptionProducer>;
  adornmentIcon?: string;
  label?: string;
  inputLabel?: string;
  type?: HTMLInputElement['type'];
  style?: PrefabComponentStyle;
  ref?: { id: string };
  inputType?: string;
  placeholder?: string;
  dataComponentAttribute?: string;
  optionCategories?: OptionCategory[];
  validationPattern?: string;
  pattern?: string;
}
`;

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  if (!/^[a-z][a-z0-9]*$/i.test(name)) {
    throw Error(
      chalk.red(`\nName cannot contain special characters or spaces\n`),
    );
  }

  if (await pathExists(`src/prefabs/${name}.tsx`)) {
    throw Error(chalk.red(`\nPrefab ${name} already exists\n`));
  }

  if (await pathExists(`src/components/${name}.js`)) {
    throw Error(chalk.red(`\nComponent ${name} already exists\n`));
  }
  const capitalisedName = name.charAt(0).toUpperCase() + name.slice(1);

  const prefabsStructureIndex = `// Import all prefabs here
import { ${capitalisedName} } from './${capitalisedName}';

// Import all prefab options here
import { ${name}Options } from './${capitalisedName}/options';

export { ${capitalisedName}, ${name}Options };
`;

  await pathExists('src/prefabs/structures/advanced.ts').then((exists) => {
    if (!exists) {
      console.log("advanced.ts didn't exist yet. Creating it");
      outputFileSync('src/prefabs/structures/advanced.ts', advancedTs);
    }
  });

  await pathExists('src/prefabs/structures/Configuration.ts').then((exists) => {
    if (!exists) {
      console.log("Configuration.ts didn't exist yet. Creating it");
      outputFileSync(
        'src/prefabs/structures/Configuration.ts',
        configurationTs,
      );
    }
  });

  await pathExists('src/prefabs/structures/index.ts').then((exists) => {
    if (!exists) {
      console.log("index.ts didn't exist yet. Creating it");
      outputFileSync('src/prefabs/structures/index.ts', prefabsStructureIndex);
    }
  });

  const prefab = `import { prefab, Icon } from '@betty-blocks/component-sdk';

import { ${capitalisedName} } from './structures/${capitalisedName}';

const attributes = {
  category: 'CONTENT',
  icon: Icon.TitleIcon,
  keywords: [''],
};

export default prefab('${capitalisedName}', attributes, undefined, [${capitalisedName}({})]);
`;

  const structureIndex = `import { component, PrefabReference } from '@betty-blocks/component-sdk';
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

  const optionsIndex = `import { variable } from '@betty-blocks/component-sdk';
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

  const component = `(() => ({
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
      structureIndex,
    ),
    outputFile(
      `src/prefabs/structures/${capitalisedName}/options/index.ts`,
      optionsIndex,
    ),
    outputFile(`src/prefabs/${name}.tsx`, prefab),
    outputFile(`src/components/${name}.js`, component),
    console.log(chalk.green('The component has been generated')),
    console.log(
      chalk.blueBright(
        "\nIf you would like to use the component in another prefab, \nwe recommend adding the import and export of the component structure to 'src/prefabs/structures/index.ts' for a clean import from the same file",
      ),
    ),
  ]);
})();
