/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return,@typescript-eslint/restrict-template-expressions */
import chalk from 'chalk';
import path from 'path';
import program, { CommanderStatic } from 'commander';
import ts from 'typescript';
import { outputJson, pathExists, promises, remove } from 'fs-extra';
import extractComponentCompatibility from './components/compatibility';
import { doTranspile } from './components/transformers';
import extractInteractionCompatibility from './interactions/compatibility';
import getDiagnostics from './interactions/diagnostics';
import {
  Component,
  Interaction,
  Prefab,
  ComponentStyleMap,
  PrefabReference,
  GroupedStyles,
  BuildPrefabReference,
  BuildPrefabComponent,
  BuildPrefab,
} from './types';
import { parseDir } from './utils/arguments';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import hash from './utils/hash';
import readFilesByType from './utils/readFilesByType';
import transpile from './utils/transpile';
import {
  checkNameReferences,
  checkOptionCategoryReferences,
} from './utils/validation';
import validateComponents from './validations/component';
import validateStyles from './validations/styles';
import validateInteractions from './validations/interaction';
import validatePrefabs from './validations/prefab';
import {
  reportDiagnostics,
  readStyles,
  buildStyle,
  buildReferenceStyle,
} from './components-build';

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
          ...compatibility,
          ...transpiledFunction,
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

  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error(chalk.red('\nPrefabs folder not found\n'));
  }

  const prefabTsFiles: string[] = await readFilesByType(srcDir, 'ts');
  const prefabTsxFiles: string[] = await readFilesByType(srcDir, 'tsx');

  const prefabFiles = [...prefabTsFiles, ...prefabTsxFiles];

  const prefabProgram = ts.createProgram(
    prefabFiles.map((file) => `${srcDir}/${file}`),
    {
      jsx: 2,
      outDir: '.prefabs',
      module: 1,
      esModuleInterop: true,
      allowSyntheticDefaultImports: false,
      target: 99,
      listEmittedFiles: true,
    },
  );

  const diagnostics = [...ts.getPreEmitDiagnostics(prefabProgram)];

  if (diagnostics.length > 0) {
    reportDiagnostics(diagnostics);
    process.exit(1);
  }

  const results = prefabProgram.emit();

  if (results.diagnostics.length > 0) {
    reportDiagnostics([...results.diagnostics]);
    process.exit(1);
  }

  const globalDiagnostics = [...prefabProgram.getGlobalDiagnostics()];
  if (globalDiagnostics.length > 0) {
    reportDiagnostics(globalDiagnostics);
    process.exit(1);
  }

  const declarationDiagnostics = [...prefabProgram.getDeclarationDiagnostics()];
  if (declarationDiagnostics.length > 0) {
    reportDiagnostics(declarationDiagnostics);
    process.exit(1);
  }

  const configDiagnostics = [
    ...prefabProgram.getConfigFileParsingDiagnostics(),
  ];
  if (configDiagnostics.length > 0) {
    reportDiagnostics(configDiagnostics);
    process.exit(1);
  }

  const prefabs: Array<Promise<Prefab>> = (results.emittedFiles || [])
    .filter((filename) => /\.(\w+\/){2}\w+\.js/.test(filename))
    .map((filename) => {
      return new Promise((resolve) => {
        import(`${absoluteRootDir}/${filename}`)
          .then((prefab) => {
            // JSON schema validation
            resolve(prefab.default);
          })
          .catch((error) => {
            throw new Error(`in ${filename}: ${error}`);
          });
      });
    });

  return Promise.all(prefabs);
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

const readPartialPrefabs: () => Promise<Prefab[]> = async (): Promise<
  Prefab[]
> => {
  const srcDir = `${rootDir}/src/prefabs/partials`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    await mkdir(srcDir, { recursive: true });
  }

  const partialPrefabFiles: string[] = await readFilesByType(srcDir);

  const partialPrefabs: Array<Promise<Prefab>> = partialPrefabFiles.map(
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

  return Promise.all(partialPrefabs);
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
    const [
      styles,
      newPrefabs,
      oldPrefabs,
      components,
      interactions,
      partialprefabs,
    ] = await Promise.all([
      readStyles(rootDir),
      readtsPrefabs(),
      readPrefabs(),
      readComponents(),
      readInteractions(),
      readPartialPrefabs(),
    ]);

    const validStyleTypes = styles.map(({ type }) => type);
    const prefabs = oldPrefabs.concat(newPrefabs);

    const stylesGroupedByTypeAndName = styles.reduce<GroupedStyles>(
      (object, e) => {
        const { name, type } = e;

        const byType = object[type] || {};

        return {
          ...object,
          [type]: {
            ...byType,
            [name]: e,
          },
        };
      },
      {},
    );

    const componentNames = components.map(({ name }) => name);

    checkNameReferences(prefabs, components);

    const componentStyleMap: ComponentStyleMap = components.reduce((acc, c) => {
      return c.styleType
        ? Object.assign(acc, { [c.name]: { styleType: c.styleType } })
        : acc;
    }, {});

    await Promise.all([
      validateStyles(styles, componentNames),
      validateComponents(components, validStyleTypes),
      validatePrefabs(prefabs, stylesGroupedByTypeAndName, componentStyleMap),
      validatePrefabs(
        partialprefabs,
        stylesGroupedByTypeAndName,
        componentStyleMap,
        'partial',
      ),
      interactions && validateInteractions(interactions),
    ]);

    checkOptionCategoryReferences(prefabs);

    const componentsWithHash = components.map((component) => {
      return {
        ...component,
        componentHash: hash(component),
      };
    });

    const buildPrefab = (prefab: Prefab): BuildPrefab => {
      const buildStructure = (
        structure: PrefabReference,
      ): BuildPrefabReference => {
        if (structure.type === 'PARTIAL') {
          return structure;
        }

        if (structure.type === 'WRAPPER') {
          const { descendants = [], ...rest } = structure;
          const wrapperStructure = {
            ...rest,
            descendants: descendants.map(buildStructure),
          };
          return wrapperStructure;
        }

        const { style, descendants, ...rest } = structure;

        const styleReference = buildReferenceStyle(style);

        const newStructure: BuildPrefabComponent = {
          ...rest,
          ...(styleReference ? { style: styleReference } : {}),
          hash: hash(structure.options),
          descendants: descendants.map(buildStructure),
        };

        return newStructure;
      };
      return {
        ...prefab,
        structure: prefab.structure.map(buildStructure),
      };
    };

    const buildStyles = styles.map(buildStyle);

    const buildPrefabs = prefabs.map(buildPrefab);
    const buildPartialprefabs = partialprefabs.map(buildPrefab);

    await mkdir(distDir, { recursive: true });

    const defaultPrefabs = buildPrefabs.filter(
      (prefab) => prefab.type !== 'page',
    );

    const outputPromises = [
      outputJson(`${distDir}/prefabs.json`, defaultPrefabs),
      outputJson(`${distDir}/templates.json`, componentsWithHash),

      interactions && outputJson(`${distDir}/interactions.json`, interactions),
    ];

    if (buildStyles.length > 0) {
      outputPromises.push(outputJson(`${distDir}/styles.json`, buildStyles));
    }

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

    if (buildPartialprefabs.length > 0) {
      outputPromises.push(
        outputJson(`${distDir}/partials.json`, buildPartialprefabs),
      );
    }

    const existingPartialPath = await pathExists(`${distDir}/partials.json`);

    if (buildPartialprefabs.length === 0 && existingPartialPath) {
      await remove(`${distDir}/partials.json`);
    }

    await Promise.all(outputPromises);

    console.info(chalk.green('Success, the component set has been built'));
  } catch (err) {
    // TODO: reduce scope of this try catch to narrow the type of error.
    // some errors will not contain these fields so it is unsafe to
    // destructure

    // eslint-disable-next-line prefer-destructuring
    const name = err.name;
    // eslint-disable-next-line prefer-destructuring
    const file = err.file;
    // eslint-disable-next-line prefer-destructuring
    const message = err.message;

    if (!name || !file || !message) {
      console.error(err);
      process.exit(1);
    }

    if (file) {
      console.error(chalk.red(`\n${name} in ${file}: ${message}\n`));
    } else {
      console.error(chalk.red(`\n${name}: ${message}\n`));
    }

    process.exit(1);
  }
})();
