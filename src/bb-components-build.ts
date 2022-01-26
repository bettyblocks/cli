/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return,@typescript-eslint/restrict-template-expressions */
import chalk from 'chalk';
import path from 'path';
import program, { CommanderStatic } from 'commander';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import { outputJson, pathExists, promises, remove } from 'fs-extra';
import extractComponentCompatibility from './components/compatibility';
import { doTranspile } from './components/transformers';
import extractInteractionCompatibility from './interactions/compatibility';
import getDiagnostics from './interactions/diagnostics';
import {
  Component,
  Interaction,
  Prefab,
  PrefabComponent,
  ComponentStyleMap,
} from './types';
import { parseDir } from './utils/arguments';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import hash from './utils/hash';
import readFilesByType from './utils/readFilesByType';
import transpile from './utils/transpile';
import { checkNameReferences } from './utils/validation';
import validateComponents from './validations/component';
import validateInteractions from './validations/interaction';
import validatePrefabs from './validations/prefab';

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
const enableNewTranspile = !!options.transpile;

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

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const transpiledFunction = Function(
          `return ${transpile(code, ['jsx', 'styles'])}`,
        )();

        if (!transpiledFunction) {
          throw new Error("Component doesn't return anything");
        }

        if (enableNewTranspile) {
          transpiledFunction.transpiledJsx = doTranspile(
            transpiledFunction.jsx,
          );

          transpiledFunction.transpiledStyles = doTranspile(
            transpiledFunction.styles,
          );
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

const readtsPrefabs: () => Promise<Prefab[]> = async (): Promise<Prefab[]> => {
  const absoluteRootDir = path.resolve(process.cwd(), rootDir);
  const srcDir = `${absoluteRootDir}/src/prefabs`;

  const fs = createFsFromVolume(new Volume());

  const compiler = webpack({
    entry: (): Promise<string[]> => {
      return readFilesByType(srcDir, 'ts').then((filenames) =>
        filenames.map((name) => `${srcDir}/${name}`),
      );
    },
    output: {
      path: `${absoluteRootDir}/dist/tsPrefabs`,
    },
    mode: 'development',
    devtool: false,
  });

  compiler.outputFileSystem = fs;

  const compile = () =>
    new Promise<void>((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          reject(err);
          return;
        }

        if (stats?.hasErrors()) {
          const messages = stats.compilation.errors.map((e) => e.message);

          reject(new Error(messages.join('/n')));
          return;
        }

        const source = fs.readFileSync(
          `${absoluteRootDir}/dist/tsPrefabs/main.js`,
          'utf-8',
        );

        console.log({ source });

        // eslint-disable-next-line no-eval
        const exported = eval(source.toString());

        console.log({ exported });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const prefab = exported();

        console.log(JSON.stringify(prefab));
      });
    });

  await compile();

  return [];
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
        // eslint-disable-next-line @typescript-eslint/no-implied-eval,@typescript-eslint/no-unsafe-assignment
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
    interactionFiles.map(async (file: string): Promise<Interaction> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

        getDiagnostics(`${srcDir}/${file}`);

        return {
          function: code,
          ...extractInteractionCompatibility(`${srcDir}/${file}`),
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.file = file;

        throw error;
      }
    }),
  );
};

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  try {
    const [, prefabs, components, interactions] = await Promise.all([
      readtsPrefabs(),
      readPrefabs(),
      readComponents(),
      readInteractions(),
    ]);

    checkNameReferences(prefabs, components);

    const componentStyleMap: ComponentStyleMap = components.reduce((acc, c) => {
      return c.styleType
        ? Object.assign(acc, { [c.name]: { styleType: c.styleType } })
        : acc;
    }, {});

    await Promise.all([
      validateComponents(components),
      validatePrefabs(prefabs, componentStyleMap),
      interactions && validateInteractions(interactions),
    ]);

    const componentsWithHash = components.map((component) => {
      return {
        ...component,
        componentHash: hash(component),
      };
    });

    type BuildPrefabComponent = PrefabComponent & {
      hash: string;
      style: PrefabComponent['style'];
    };

    const buildPrefabs = prefabs.map((prefab) => {
      const buildStructure = (
        structure: PrefabComponent,
      ): BuildPrefabComponent => {
        const newStructure = {
          ...structure,
          style: structure.style || {},
          hash: hash(structure.options),
        };

        if (newStructure.descendants && newStructure.descendants.length > 0) {
          newStructure.descendants =
            newStructure.descendants.map(buildStructure);
        }

        return newStructure;
      };

      return {
        ...prefab,
        structure: prefab.structure.map(buildStructure),
      };
    });

    await mkdir(distDir, { recursive: true });

    const defaultPrefabs = buildPrefabs.filter(
      (prefab) => prefab.type !== 'page',
    );

    const outputPromises = [
      outputJson(`${distDir}/prefabs.json`, defaultPrefabs),
      outputJson(`${distDir}/templates.json`, componentsWithHash),
      interactions && outputJson(`${distDir}/interactions.json`, interactions),
    ];

    const pagePrefabs = prefabs.filter((prefab) => prefab.type === 'page');

    if (pagePrefabs.length > 0) {
      outputPromises.push(
        outputJson(`${distDir}/pagePrefabs.json`, pagePrefabs),
      );
    }

    const existingPath = await pathExists(`${distDir}/pagePrefabs.json`);

    if (pagePrefabs.length === 0 && existingPath) {
      await remove(`${distDir}/pagePrefabs.json`);
    }

    await Promise.all(outputPromises);

    console.info(chalk.green('Success, the component set has been built'));
  } catch ({ file, name, message }) {
    if (file) {
      console.error(chalk.red(`\n${name} in ${file}: ${message}\n`));
    } else {
      console.error(chalk.red(`\n${name}: ${message}\n`));
    }

    process.exit(1);
  }
})();
