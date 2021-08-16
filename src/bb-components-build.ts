/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { outputJson, pathExists, promises, remove } from 'fs-extra';

import extractComponentCompatibility from './components/compatibility';
import extractInteractionCompatibility from './interactions/compatibility';
import getDiagnostics from './interactions/diagnostics';
import { Component, Interaction, Prefab, PrefabComponent } from './types';
import { parseDir } from './utils/arguments';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import hash from './utils/hash';
import readFilesByType from './utils/readFilesByType';
import transpile from './utils/transpile';
import { checkNameReferences } from './utils/validation';
/* internal dependencies */
import validateComponents from './validations/component';
import validateInteractions from './validations/interaction';
import validatePrefabs from './validations/prefab';

/* npm dependencies */

const { mkdir, readFile } = promises;

/* process arguments */

program
  .usage('[path]')
  .name('bb components build')
  .option('-t, --transpile', 'enable new transpilation')
  .parse(process.argv);

const { args }: CommanderStatic = program;
const options = program.opts();
const rootDir: string = parseDir(args);
const distDir = `${rootDir}/dist`;
const enableNewTranspile: boolean = options.transpile;
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

        const compatibility = extractComponentCompatibility(code);

        // eslint-disable-next-line no-new-func
        const transpiledFunction = Function(
          `return ${transpile(code, ['jsx', 'styles'], enableNewTranspile)}`,
        )();

        if (!transpiledFunction) {
          throw new Error("Component doesn't return anything");
        }

        return {
          ...transpiledFunction,
          ...compatibility,
        };
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
        const transpiledFunction = Function(
          `return ${transpile(code, ['beforeCreate'])}`,
        )();

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
    return new Promise((resolve): void => {
      resolve([]);
    });
  }

  const interactionFiles: string[] = await readFilesByType(srcDir, 'ts');

  return Promise.all(
    interactionFiles.map(
      async (file: string): Promise<Interaction> => {
        try {
          const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

          getDiagnostics(`${srcDir}/${file}`);

          return {
            // failing because it's a keyword
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            function: code,
            ...extractInteractionCompatibility(`${srcDir}/${file}`),
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
      interactions && validateInteractions(interactions),
    ]);

    const componentsWithHash = components.map(component => {
      return {
        ...component,
        componentHash: hash(component),
      };
    });

    type PrefabComponentWithHash = PrefabComponent & { hash: string };

    const prefabsWithHash = prefabs.map(prefab => {
      const hashStructure = (
        structure: PrefabComponent,
      ): PrefabComponentWithHash => {
        const newStructure = {
          ...structure,
          hash: hash(structure.options),
        };

        if (newStructure.descendants && newStructure.descendants.length > 0) {
          newStructure.descendants = newStructure.descendants.map(
            hashStructure,
          );
        }

        return newStructure;
      };

      return {
        ...prefab,
        structure: prefab.structure.map(hashStructure),
      };
    });

    await mkdir(distDir, { recursive: true });

    const defaultPrefabs = prefabsWithHash.filter(
      prefab => prefab.type !== 'page',
    );

    const outputPromises = [
      outputJson(`${distDir}/prefabs.json`, defaultPrefabs),
      outputJson(`${distDir}/templates.json`, componentsWithHash),
      interactions && outputJson(`${distDir}/interactions.json`, interactions),
    ];

    const pagePrefabs = prefabs.filter(prefab => prefab.type === 'page');

    if (pagePrefabs.length > 0) {
      outputPromises.push(
        outputJson(`${distDir}/pagePrefabs.json`, pagePrefabs),
      );
    }

    if (pagePrefabs.length === 0 && pathExists(`${distDir}/pagePrefabs.json`)) {
      remove(`${distDir}/pagePrefabs.json`);
    }

    await Promise.all(outputPromises);

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
