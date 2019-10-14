import program, { CommanderStatic } from 'commander';
import { promises, outputJson, pathExists } from 'fs-extra';
import { Component, Prefab } from './types';
import checkUpdateAvailable from './utils/checkUpdateAvailable';

import validateComponent from './validations/component';
import validatePrefab from './validations/prefab';
import transpile from './utils/transpile';
import readScripts from './utils/readScripts';
import { parseDir } from './utils/arguments';

const { mkdir, readFile } = promises;

program
  .usage('[path]')
  .name('bb components build')
  .parse(process.argv);

const buildComponents: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/components`;
  const distDir = `${rootDir}/dist`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    return outputJson(`${distDir}/templates.json`, []);
  }

  const componentFiles: string[] = await readScripts(srcDir);

  const components: Array<Promise<Component>> = componentFiles.map(
    async (file: string): Promise<Component> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      // eslint-disable-next-line no-new-func
      return Function(`return ${transpile(code)}`)();
    },
  );

  const output: Component[] = await Promise.all(components);

  validateComponent(output);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/templates.json`, output);

  return Promise.resolve();
};

const buildPrefabs: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/prefabs`;
  const distDir = `${rootDir}/dist`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    return outputJson(`${distDir}/prefabs.json`, []);
  }

  const prefabFiles: string[] = await readScripts(srcDir);

  const prefabs: Array<Promise<Prefab>> = prefabFiles.map(
    async (file: string): Promise<Prefab> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      // eslint-disable-next-line no-new-func
      return Function(`return ${code}`)();
    },
  );

  const output: Prefab[] = await Promise.all(prefabs);

  validatePrefab(output);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/prefabs.json`, output);

  return Promise.resolve();
};

(async (): Promise<void> => {
  const { args }: CommanderStatic = program;
  const rootDir: string = parseDir(args);

  try {
    await checkUpdateAvailable();

    await Promise.all([buildComponents(rootDir), buildPrefabs(rootDir)]);

    console.info('Success');
  } catch ({ message }) {
    console.error(message);
  }
})();
