import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs';
import {
  ensureDir,
  outputJson,
  pathExists,
  readFile,
  readFileSync,
  remove,
} from 'fs-extra';
import path from 'path';
import ts, { JsxEmit, ModuleKind, ScriptTarget } from 'typescript';

import extractComponentCompatibility from './components/compatibility';
import { doTranspile } from './components/transformers';
import {
  buildReferenceStyle,
  buildStyle,
  readStyles,
  reportDiagnostics,
} from './components-build';
import extractInteractionCompatibility from './interactions/compatibility';
import getDiagnostics from './interactions/diagnostics';
import type {
  BuildPrefab,
  BuildPrefabComponent,
  BuildPrefabReference,
  Component,
  ComponentDependency,
  GroupedStyles,
  Interaction,
  Prefab,
  PrefabReference,
} from './types';
import { parseDir } from './utils/arguments';
import { checkPackageVersion } from './utils/checkPackageVersion';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import hash from './utils/hash';
import readFilesByType from './utils/readFilesByType';
import transpile from './utils/transpile';
import {
  checkNameReferences,
  checkOptionCategoryReferences,
} from './utils/validation';
import validateComponents from './validations/component';
import validateInteractions from './validations/interaction';
import validatePrefabs from './validations/prefab';
import validateStyles from './validations/styles';

const program = new Command();

program
  .usage('[path]')
  .name('bb components build')
  .option('-t, --transpile', 'enable new transpilation')
  .option('--offline', 'skip update check')
  .option('--fast', 'Build the last edited component.')
  .parse(process.argv);

const { args } = program;
const options = program.opts();
const rootDir: string = parseDir(args);
const distDir = `${rootDir}/dist`;
const enableNewTranspile = !!options.transpile;
const arg = process.argv.slice(2);
const startTime = Date.now();
const buildAll = !arg.includes('--fast');
const hasOfflineFlag = arg.includes('--offline');

/* execute command */

const readComponents: () => Promise<Component[]> = async (): Promise<
  Component[]
> => {
  const srcDir = `${rootDir}/src/components`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error(chalk.red('\nComponents folder not found\n'));
  }

  const componentFiles: string[] = await readFilesByType(
    srcDir,
    'js',
    buildAll,
  );

  const components: Promise<Component>[] = componentFiles.map(
    async (file: string): Promise<Component> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

        const compatibility = extractComponentCompatibility(code);

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

        if (transpiledFunction.dependencies && !hasOfflineFlag) {
          const usedPackages = (
            transpiledFunction.dependencies as ComponentDependency[]
          ).map((usedDependency) => usedDependency.package);

          const dependencyPromises = usedPackages.map(
            async (usedPackage: string): Promise<void> => {
              await checkPackageVersion(usedPackage.replace(/^npm:/g, ''));
            },
          );

          await Promise.all(dependencyPromises);
        }

        return {
          ...compatibility,
          ...transpiledFunction,
        };
      } catch (error) {
        throw new Error(`in ${file}: ${error}`);
      }
    },
  );

  return Promise.all(components);
};

const readtsPrefabs: (isPartial?: boolean) => Promise<Prefab[]> = async (
  isPartial = false,
): Promise<Prefab[]> => {
  const absoluteRootDir = path.resolve(process.cwd(), rootDir);
  const srcDir = `${absoluteRootDir}/src/prefabs`;
  const outDir = `${absoluteRootDir}/tmp/${Math.floor(Date.now() / 1000)}`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error(chalk.red('\nPrefabs folder not found\n'));
  }

  let prefabTsFiles: string[] = [];
  let prefabTsxFiles: string[] = [];
  let partialTsxFiles: string[] = [];

  if (isPartial) {
    partialTsxFiles = await readFilesByType(
      `${srcDir}/partials`,
      'tsx',
      buildAll,
    );
  } else {
    prefabTsFiles = await readFilesByType(srcDir, 'ts', buildAll);
    prefabTsxFiles = await readFilesByType(srcDir, 'tsx', buildAll);
  }

  const prefabFiles = [...prefabTsFiles, ...prefabTsxFiles];

  const files = isPartial ? partialTsxFiles : prefabFiles;
  const basePath = isPartial ? `${srcDir}/partials/` : `${srcDir}/`;
  const prefabProgram = ts.createProgram(
    files.map((file) => `${basePath}/${file}`),
    {
      allowSyntheticDefaultImports: false,
      esModuleInterop: true,
      jsx: JsxEmit.React,
      listEmittedFiles: true,
      module: ModuleKind.CommonJS,
      outDir,
      target: ScriptTarget.ESNext,
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

  const prefabs: Promise<Prefab>[] = (results.emittedFiles ?? [])
    .filter((filename) =>
      isPartial
        ? /prefabs\/partials\/\w+\.js$/.test(filename)
        : /prefabs\/\w+\.js$/.test(filename),
    )
    .map(
      (filename) =>
        new Promise((resolve) => {
          import(filename)
            .then((prefab) => {
              // JSON schema validation
              resolve(prefab.default);
            })
            .catch((error) => {
              throw new Error(`in ${filename}: ${error}`);
            });
        }),
    );

  return Promise.all(prefabs);
};

const readPrefabs: () => Promise<Prefab[]> = async (): Promise<Prefab[]> => {
  const srcDir = `${rootDir}/src/prefabs`;
  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    throw new Error(chalk.red('\nPrefabs folder not found\n'));
  }

  const prefabFiles: string[] = await readFilesByType(srcDir, 'js', buildAll);

  const prefabs: Promise<Prefab>[] = prefabFiles.map(
    async (file: string): Promise<Prefab> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

        const transpiledFunction = Function(
          `return ${transpile(code, ['beforeCreate'])}`,
        )();

        if (!transpiledFunction) {
          throw new Error("Prefab doesn't return anything");
        }

        return transpiledFunction;
      } catch (error) {
        throw new Error(`in ${file}: ${error}`);
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
    await ensureDir(srcDir);
  }

  const partialPrefabFiles: string[] = await readFilesByType(
    srcDir,
    'js',
    buildAll,
  );

  const partialPrefabs: Promise<Prefab>[] = partialPrefabFiles.map(
    async (file: string): Promise<Prefab> => {
      try {
        const code: string = await readFile(`${srcDir}/${file}`, 'utf-8');

        const transpiledFunction = Function(
          `return ${transpile(code, ['beforeCreate'])}`,
        )();

        if (!transpiledFunction) {
          throw new Error("Prefab doesn't return anything");
        }

        return transpiledFunction;
      } catch (error) {
        throw new Error(`in ${file}: ${error}`);
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

  const interactionFiles: string[] = await readFilesByType(
    srcDir,
    'ts',
    buildAll,
  );

  return Promise.all(
    interactionFiles.map(async (file: string): Promise<Interaction> => {
      try {
        getDiagnostics(`${srcDir}/${file}`);
        return {
          ...extractInteractionCompatibility(`${srcDir}/${file}`),
        };
      } catch (error) {
        throw new Error(`in ${file}: ${error}`);
      }
    }),
  );
};

void (async (): Promise<void> => {
  if (!hasOfflineFlag) {
    await checkUpdateAvailableCLI();
  }

  try {
    const [
      styles,
      tsxPrefabs,
      jsPrefabs,
      components,
      interactions,
      tsxPartialPrefabs,
      partialprefabs,
    ] = await Promise.all([
      readStyles(rootDir),
      readtsPrefabs(),
      readPrefabs(),
      readComponents(),
      readInteractions(),
      readPartialPrefabs(),
      readtsPrefabs(true),
    ]);

    const templatesPath = path.join(distDir, 'templates.json');
    let existingComponents: Component[] = [];

    if (fs.existsSync(templatesPath)) {
      const templatesData = fs.readFileSync(templatesPath, 'utf8');
      existingComponents = JSON.parse(templatesData);
    } else {
      console.warn('templates.json file not found: building template.json');
    }

    const validStyleTypes = styles.map(({ type }) => type);
    const prefabs = jsPrefabs
      .concat(tsxPrefabs)
      .filter((prefab): prefab is Prefab => !!prefab)
      .filter((prefab) => prefab.name);

    const allPartialPrefabs = partialprefabs
      .concat(tsxPartialPrefabs)
      .filter((prefab): prefab is Prefab => !!prefab);

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

    let finalComponents: Component[];
    if (fs.existsSync(templatesPath)) {
      const templatesData = fs.readFileSync(templatesPath, 'utf8');
      finalComponents = JSON.parse(templatesData);
    } else {
      // Here we have to build templates
      finalComponents = components;
    }

    const componentNames = finalComponents.map(({ name }) => name);

    checkNameReferences(prefabs, finalComponents);

    const {
      availableNames: availableComponentNames,
      styleMap: componentStyleMap,
    } = components.reduce<{
      availableNames: string[];
      styleMap: Record<string, { styleType: string }>;
    }>(
      ({ availableNames, styleMap }, component) => {
        const newNames = availableNames.includes(component.name)
          ? availableNames
          : [...availableNames, component.name];

        const newStyleMap = component.styleType
          ? Object.assign(styleMap, {
              [component.name]: { styleType: component.styleType },
            })
          : styleMap;

        return { availableNames: newNames, styleMap: newStyleMap };
      },
      { availableNames: [], styleMap: {} },
    );

    await Promise.all([
      validateStyles(styles, componentNames),
      validateComponents(components, validStyleTypes),
      validatePrefabs({
        availableComponentNames,
        componentStyleMap,
        prefabs,
        styles: stylesGroupedByTypeAndName,
      }),
      validatePrefabs({
        availableComponentNames,
        componentStyleMap,
        prefabType: 'partial',
        prefabs: allPartialPrefabs,
        styles: stylesGroupedByTypeAndName,
      }),
      interactions && validateInteractions(interactions),
    ]);

    checkOptionCategoryReferences(prefabs);

    const componentsWithHash = components.map((component) => ({
      ...component,
      componentHash: hash(component),
    }));

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
          descendants: descendants.map(buildStructure),
          hash: hash(structure.options),
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
    const buildPartialprefabs = allPartialPrefabs.map(buildPrefab);

    await ensureDir(distDir);

    const defaultPrefabs = buildPrefabs.filter(
      (prefab) => prefab.type !== 'page',
    );

    const pagePrefabs = prefabs.filter((prefab) => prefab.type === 'page');
    const existingPath = await pathExists(`${distDir}/pagePrefabs.json`);
    const existingPartialPath = await pathExists(`${distDir}/partials.json`);

    if (buildAll) {
      const outputPromises = [
        outputJson(`${distDir}/prefabs.json`, defaultPrefabs),
        outputJson(`${distDir}/templates.json`, componentsWithHash),

        interactions &&
          outputJson(`${distDir}/interactions.json`, interactions),
      ];

      if (buildStyles.length > 0) {
        outputPromises.push(outputJson(`${distDir}/styles.json`, buildStyles));
      }

      if (pagePrefabs.length > 0) {
        outputPromises.push(
          outputJson(`${distDir}/pagePrefabs.json`, pagePrefabs),
        );
      }

      if (buildPartialprefabs.length > 0) {
        outputPromises.push(
          outputJson(`${distDir}/partials.json`, buildPartialprefabs),
        );
      }

      await Promise.all(outputPromises);
    } else {
      const existingPrefabs: Prefab[] = JSON.parse(
        readFileSync(`${distDir}/prefabs.json`, 'utf8'),
      );

      interface ComponentWithHash extends Component {
        componentHash: string;
      }
      type Element =
        | ComponentWithHash
        | Component
        | Prefab
        | Interaction
        | BuildPrefab;

      const replaceInSet = (
        existingElements: Element[],
        newElements: Element[],
      ): Element[] =>
        existingElements.map((existingElement) => {
          if (
            newElements.length > 0 &&
            existingElement.name === newElements[0].name
          ) {
            return newElements[0];
          }
          return existingElement;
        });

      const updatedPrefabs = replaceInSet(existingPrefabs, prefabs);

      const updatedComponents = replaceInSet(
        existingComponents,
        componentsWithHash,
      );

      const existingInteractions: Interaction[] = JSON.parse(
        readFileSync(`${distDir}/interactions.json`, 'utf8'),
      );

      const updatedInteractions = replaceInSet(
        existingInteractions,
        interactions,
      );

      const newOutputPromises = [
        outputJson(`${distDir}/prefabs.json`, updatedPrefabs),
        outputJson(`${distDir}/templates.json`, updatedComponents),

        interactions &&
          outputJson(`${distDir}/interactions.json`, updatedInteractions),
      ];

      const existingPagePrefabs: Prefab[] = JSON.parse(
        readFileSync(`${distDir}/pagePrefabs.json`, 'utf8'),
      );

      const updatedPagePrefabs = replaceInSet(existingPagePrefabs, pagePrefabs);

      if (existingPath && pagePrefabs.length > 0) {
        newOutputPromises.push(
          outputJson(`${distDir}/pagePrefabs.json`, updatedPagePrefabs),
        );
      }

      const existingPartials: Prefab[] = JSON.parse(
        readFileSync(`${distDir}/partials.json`, 'utf8'),
      );

      const updatedPartials = replaceInSet(
        existingPartials,
        buildPartialprefabs,
      );

      if (existingPartialPath && buildPartialprefabs.length > 0) {
        newOutputPromises.push(
          outputJson(`${distDir}/partials.json`, updatedPartials),
        );
      }

      await Promise.all(newOutputPromises);
    }

    if (buildPartialprefabs.length === 0 && existingPartialPath && buildAll) {
      await remove(`${distDir}/partials.json`);
    }

    if (pagePrefabs.length === 0 && existingPath && buildAll) {
      await remove(`${distDir}/pagePrefabs.json`);
    }

    console.info(chalk.green('Success, the component set has been built'));
  } catch (error) {
    // Handle both Error objects and custom error objects
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      'file' in error &&
      'message' in error
    ) {
      const { name, file, message } = error as {
        name: string;
        file: string;
        message: string;
      };
      console.error(chalk.red(`\n${name} in ${file}: ${message}\n`));
    } else if (error instanceof Error) {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    } else {
      console.error(chalk.red('\nAn unknown error occurred:\n'));
      console.error(error);
    }

    process.exit(1);
  }
  console.info(`Total time: ${(Date.now() - startTime) / 1000} seconds`);
})();
