/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import { promises, outputJson, pathExists } from 'fs-extra';
import { Component, Prefab } from './types';

/* internal dependencies */

import validateComponents from './validations/component';
import validatePrefabs from './validations/prefab';
import transpile from './utils/transpile';
import readScripts from './utils/readScripts';
import { parseDir } from './utils/arguments';
import { checkNameReferences } from './utils/validation';
import checkUpdateAvailable from './utils/checkUpdateAvailable';

/* npm dependencies */

const { mkdir, readFile } = promises;

/* process arguments */

program
  .usage('[path]')
  .name('bb components build')
  .parse(process.argv);

const { args }: CommanderStatic = program;
const rootDir: string = parseDir(args);
const distDir = `${rootDir}/dist`;

/* execute command */

const readComponents: () => Promise<Component[]> = async (): Promise<
  Component[]
> => {
  const srcDir = `${rootDir}/src/components`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error('Components folder not found');
  }

  const componentFiles: string[] = await readScripts(srcDir);

  const components: Array<Promise<Component>> = componentFiles.map(
    async (file: string): Promise<Component> => {
      const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

      // eslint-disable-next-line no-new-func
      return Function(`return ${transpile(code)}`)();
    },
  );

  return Promise.all(components);
};

const buildComponents: (components: Component[]) => Promise<void> = async (
  components: Component[],
) => {
  await outputJson(`${distDir}/templates.json`, components);

  return Promise.resolve();
};

const readPrefabs: () => Promise<Prefab[]> = async (): Promise<Prefab[]> => {
  const srcDir = `${rootDir}/src/prefabs`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error('Prefabs folder not found');
  }

  const prefabFiles: string[] = await readScripts(srcDir);

  const prefabs: Array<Promise<Prefab>> = prefabFiles.map(
    async (file: string): Promise<Prefab> => {
      const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

      // eslint-disable-next-line no-new-func
      return Function(`return ${code}`)();
    },
  );

  return Promise.all(prefabs);
};

const buildPrefabs: (prefabs: Prefab[]) => Promise<void> = async (
  prefabs: Prefab[],
) => {
  await outputJson(`${distDir}/prefabs.json`, prefabs);

  return Promise.resolve();
};

(async (): Promise<void> => {
  try {
    await checkUpdateAvailable();

    const [prefabs, components]: [Prefab[], Component[]] = await Promise.all([
      readPrefabs(),
      readComponents(),
    ]);

    checkNameReferences(prefabs, components);

    await Promise.all([
      validateComponents(components),
      validatePrefabs(prefabs),
    ]);

    await mkdir(distDir, { recursive: true });
    await Promise.all([buildComponents(components), buildPrefabs(prefabs)]);

    console.info('Success');
  } catch ({ message }) {
    throw new Error(message);
  }
})();
