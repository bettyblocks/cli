import program, { CommanderStatic } from 'commander';
import { promises, outputJson, pathExists } from 'fs-extra';
import { Component, Prefab } from './types';
import checkUpdateAvailable from './utils/checkUpdateAvailable';

import validateComponent from './validations/component';
import validatePrefab from './validations/prefab';
import transpile from './utils/transpile';
import readScripts from './utils/readScripts';
import { parseDir } from './utils/arguments';
import { checkNameReferences } from './utils/validation';

const { mkdir, readFile } = promises;

program
  .usage('[path]')
  .name('bb components build')
  .parse(process.argv);

const readComponents: (rootDir: string) => Promise<Component[]> = async (
  rootDir: string,
): Promise<Component[]> => {
  const srcDir = `${rootDir}/src/components`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error('Components folder not found');
  }

  const componentFiles: string[] = await readScripts(srcDir);

  const components: Array<Promise<Component>> = componentFiles.map(
    async (file: string): Promise<Component> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      // eslint-disable-next-line no-new-func
      return Function(`return ${transpile(code)}`)();
    },
  );

  return Promise.all(components);
};

const buildComponents: (
  rootDir: string,
  components: Component[],
) => Promise<void> = async (rootDir: string, components: Component[]) => {
  const distDir = `${rootDir}/dist`;

  validateComponent(components);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/templates.json`, components);

  return Promise.resolve();
};

const readPrefabs: (rootDir: string) => Promise<Prefab[]> = async (
  rootDir: string,
): Promise<Prefab[]> => {
  const srcDir = `${rootDir}/src/prefabs`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error('Prefabs folder not found');
  }

  const prefabFiles: string[] = await readScripts(srcDir);

  const prefabs: Array<Promise<Prefab>> = prefabFiles.map(
    async (file: string): Promise<Prefab> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      // eslint-disable-next-line no-new-func
      return Function(`return ${code}`)();
    },
  );

  return Promise.all(prefabs);
};

const buildPrefabs: (
  rootDir: string,
  prefabs: Prefab[],
) => Promise<void> = async (rootDir: string, prefabs: Prefab[]) => {
  validatePrefab(prefabs);
  const distDir = `${rootDir}/dist`;

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/prefabs.json`, prefabs);

  return Promise.resolve();
};

(async (): Promise<void> => {
  const { args }: CommanderStatic = program;
  const rootDir: string = parseDir(args);

  try {
    await checkUpdateAvailable();

    const [prefabs, components] = await Promise.all([
      readPrefabs(rootDir),
      readComponents(rootDir),
    ]);

    checkNameReferences(prefabs, components);

    await Promise.all([
      buildComponents(rootDir, components),
      buildPrefabs(rootDir, prefabs),
    ]);

    console.info('Success');
  } catch ({ message }) {
    console.error(message);
  }
})();
