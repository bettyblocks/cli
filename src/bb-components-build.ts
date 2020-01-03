/* npm dependencies */

import YAML from 'yaml';
import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { outputJson, pathExists, mkdirp, readFile, readJson } from 'fs-extra';

/* internal dependencies */

import getRootDir from './utils/getRootDir';
import readScripts from './utils/readScripts';
import transpile from './utils/transpile';
import validateComponents from './validations/component';
import validatePrefabs from './validations/prefab';
import { Component, ComponentSet, Prefab } from './types';
import { validateNameAndRefs } from './utils/validation';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import { parseDir } from './utils/arguments';

/* process arguments */

program
  .usage('[path]')
  .name('bb components build')
  .parse(process.argv);

const { args }: CommanderStatic = program;
const rootDir: string = parseDir(args);
const distDir = `${rootDir}/dist`;

/* execute command */

const readComponents: () => Promise<
  Component[]
> = async (): Promise<Component[]> => {
  const srcDir = `${rootDir}/src/components`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error(chalk.red('\nComponents folder not found\n'));
  }

  const componentFiles: string[] = await readScripts(srcDir);

  const components: Array<Promise<Component>> = componentFiles.map(
    async (file: string): Promise<Component> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

        // eslint-disable-next-line no-new-func
        return Function(`return ${transpile(code)}`)();
      } catch (error) {
        error.file = file;

        throw error;
      }
    },
  );

  return Promise.all(components);
};

const readPrefabs: () => Promise<Prefab[]> = async (): Promise<Prefab[]> => {
  const srcDir = `${rootDir}/src/prefabs`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error(chalk.red('\nPrefabs folder not found\n'));
  }

  const prefabFiles: string[] = await readScripts(srcDir);

  const prefabs: Array<Promise<Prefab>> = prefabFiles.map(
    async (file: string): Promise<Prefab> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

        // eslint-disable-next-line no-new-func
        return Function(`return ${code}`)();
      } catch (error) {
        error.file = file;

        throw error;
      }
    },
  );

  return Promise.all(prefabs);
};

const readSrc = async (): Promise<ComponentSet> => {
  const [prefabs, components] = await Promise.all([
    readPrefabs(),
    readComponents(),
  ]);

  return { prefabs, components };
};

const readDependencies = async (
  dependencies: string[],
): Promise<ComponentSet[]> =>
  Promise.all(
    dependencies.map(
      async (scope: string): Promise<ComponentSet> => {
        const dir = `${rootDir}/betty_blocks/${scope}`;
        const [prefabs, components] = await Promise.all([
          readJson(`${dir}/prefabs.json`),
          readJson(`${dir}/templates.json`),
        ]);

        return {
          prefabs,
          components,
        };
      },
    ),
  );

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  try {
    const root = await getRootDir();
    const contents = await readFile(`${root}/bettyblocks.yaml`);
    const yaml = YAML.parse(contents.toString());
    const dependencies = Object.keys(yaml.dependencies);
    const scopes = [yaml.name, ...dependencies];

    const componentSet = await readSrc();
    const componentSetDependencies = await readDependencies(dependencies);

    const components = [
      ...componentSet.components,
      ...componentSetDependencies.flatMap(set => set.components),
    ];

    const prefabs = [
      ...componentSet.prefabs,
      ...componentSetDependencies.flatMap(set => set.prefabs),
    ];

    validateNameAndRefs({ components, prefabs }, scopes);

    await Promise.all([
      validateComponents(components),
      validatePrefabs(prefabs),
    ]);

    await mkdirp(distDir);

    await Promise.all([
      outputJson(`${distDir}/prefabs.json`, prefabs),
      outputJson(`${distDir}/templates.json`, components),
    ]);

    console.info(chalk.green('Success, the component set has been built'));
  } catch ({ file, name, message }) {
    if (file) {
      console.error(chalk.red(`${name} in ${file}: ${message}`));
    } else {
      console.error(chalk.red(`${name}: ${message}`));
    }
  }
})();
