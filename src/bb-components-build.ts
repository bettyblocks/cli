/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { outputJson, pathExists, promises } from 'fs-extra';

import extractCompatibility from './interactions/compatibility';
import { Component, Interaction, Prefab } from './types';
import { parseDir } from './utils/arguments';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import readFilesByType from './utils/readFilesByType';
import transpile from './utils/transpile';
import { checkNameReferences } from './utils/validation';
/* internal dependencies */
import validateComponents from './validations/component';
import validatePrefabs from './validations/prefab';
import validateInteractions from './validations/interaction';

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
    throw new Error(chalk.red('\nComponents folder not found\n'));
  }

  const componentFiles: string[] = await readFilesByType(srcDir);

  const components: Array<Promise<Component>> = componentFiles.map(
    async (file: string): Promise<Component> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');
        // eslint-disable-next-line no-new-func
        const transpiledFunction = Function(`return ${transpile(code)}`)();

        if (!transpiledFunction) {
          throw new Error("Component doesn't return anything");
        }

        return transpiledFunction;
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

  const prefabFiles: string[] = await readFilesByType(srcDir);

  const prefabs: Array<Promise<Prefab>> = prefabFiles.map(
    async (file: string): Promise<Prefab> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');
        // eslint-disable-next-line no-new-func
        const transpiledFunction = Function(`return ${code}`)();

        if (!transpiledFunction) {
          throw new Error("Prefab doesn't return anything");
        }

        return transpiledFunction;
      } catch (error) {
        error.file = file;
        throw error;
      }
    },
  );

  return Promise.all(prefabs);
};

const readInteractions: () => Promise<Interaction[]> = async (): Promise<
  Interaction[]
> => {
  const srcDir = `${rootDir}/src/interactions`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error(chalk.red('\nInteractions folder not found\n'));
  }

  const interactionFiles: string[] = await readFilesByType(srcDir, 'ts');

  return Promise.all(
    interactionFiles.map(
      async (file: string): Promise<Interaction> => {
        try {
          const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

          return {
            function: code,
            ...extractCompatibility(code),
          };
        } catch (error) {
          error.file = file;

          throw error;
        }
      },
    ),
  );
};

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  try {
    const [prefabs, components, interactions] = await Promise.all([
      readPrefabs(),
      readComponents(),
      readInteractions(),
    ]);

    checkNameReferences(prefabs, components);

    await Promise.all([
      validateComponents(components),
      validatePrefabs(prefabs),
      validateInteractions(interactions),
    ]);

    await mkdir(distDir, { recursive: true });

    await Promise.all([
      outputJson(`${distDir}/prefabs.json`, prefabs),
      outputJson(`${distDir}/templates.json`, components),
      outputJson(`${distDir}/interactions.json`, interactions),
    ]);

    console.info(chalk.green('Success, the component set has been built'));
  } catch ({ file, name, message }) {
    process.exitCode = 1;
    if (file) {
      console.error(chalk.red(`\n${name} in ${file}: ${message}\n`));
    } else {
      console.error(chalk.red(`\n${name}: ${message}\n`));
    }
  }
})();
