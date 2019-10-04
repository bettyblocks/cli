import program, { CommanderStatic } from 'commander';
import { promises, outputJson, pathExists } from 'fs-extra';
import { Component, Prefab } from './types';
import { validateDuplicateNames } from './utils/validation';

import { validateSchema as validateComponentSchema } from './validations/component';
import { validateSchema as validatePrefabSchema } from './validations/prefab';
import { validateSchema as validatePartialSchema } from './validations/partial';

import transpile from './utils/transpile';
import readScripts from './utils/readScripts';

const { mkdir, readFile } = promises;

program
  .usage('[path]')
  .name('bb components build')
  .parse(process.argv);

const { args }: CommanderStatic = program;
const rootDir: string = args.length === 0 ? '.' : args[0];

const buildComponents: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/components`;
  const distDir = `${rootDir}/dist`;
  const exists = await pathExists(srcDir);

  if (!exists) {
    return await outputJson(`${distDir}/templates.json`, []);
  }

  const componentFiles: string[] = await readScripts(srcDir);

  const promises = componentFiles.map(
    async (file: string): Promise<Component> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      return Function(`return ${transpile(code)}`)();
    },
  );

  const output: Component[] = await Promise.all(promises);

  validateDuplicateNames(output);
  validateComponentSchema(output);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/templates.json`, output);
};

const buildPrefabs: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/prefabs`;
  const distDir = `${rootDir}/dist`;
  const exists = await pathExists(srcDir);

  if (!exists) {
    return await outputJson(`${distDir}/prefabs.json`, []);
  }

  const prefabFiles: string[] = await readScripts(srcDir);

  const promises = prefabFiles.map(
    async (file: string): Promise<Prefab> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      return Function(`return ${code}`)();
    },
  );

  const output: Prefab[] = await Promise.all(promises);

  validateDuplicateNames(output);
  validatePrefabSchema(output);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/prefabs.json`, output);
};

const buildPartials: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/partials`;
  const distDir = `${rootDir}/dist`;
  const exists = await pathExists(srcDir);

  if (!exists) {
    return await outputJson(`${distDir}/partials.json`, []);
  }

  const partialFiles: string[] = await readScripts(srcDir);

  const promises = partialFiles.map(
    async (file: string): Promise<Prefab> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      return Function(`return ${code}`)();
    },
  );

  const output: Prefab[] = await Promise.all(promises);

  validateDuplicateNames(output);
  validatePartialSchema(output);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/partials.json`, output);
};

(async (): Promise<void> => {
  try {
    await buildComponents(rootDir);
    await buildPrefabs(rootDir);
    await buildPartials(rootDir);
    console.info('Success');
  } catch ({ message }) {
    console.error(message);
  }
})();
