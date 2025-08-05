import path from 'path';
import ts from 'typescript';
import { pathExists, ensureDir } from 'fs-extra';

import type {
  StyleDefinition,
  BuildStyleDefinition,
  PrefabComponent,
  BuildStyle,
  StyleDefinitionContentOverwrites,
  BuildStyleDefinitionContentOverwrites,
} from '../types';
import readFilesByType from '../utils/readFilesByType';

import { reportDiagnostics } from './reportDiagnostics';

export const readStyles: (
  rootDir: string,
) => Promise<StyleDefinition[]> = async (
  rootDir: string,
): Promise<StyleDefinition[]> => {
  const absoluteRootDir = path.resolve(process.cwd(), rootDir);
  const srcDir = `${absoluteRootDir}/src/styles`;

  const exists: boolean = await pathExists(srcDir);

  if (!exists) {
    await ensureDir(srcDir);
  }

  const styleFiles: string[] = await readFilesByType(srcDir, 'ts');

  const styleProgram = ts.createProgram(
    styleFiles.map((file) => `${srcDir}/${file}`),
    {
      outDir: '.styles',
      module: 1,
      esModuleInterop: true,
      allowSyntheticDefaultImports: false,
      target: 99,
      listEmittedFiles: true,
    },
  );

  const diagnostics = [...ts.getPreEmitDiagnostics(styleProgram)];

  if (diagnostics.length > 0) {
    reportDiagnostics(diagnostics);
    process.exit(1);
  }

  const results = styleProgram.emit();

  if (results.diagnostics.length > 0) {
    reportDiagnostics([...results.diagnostics]);
    process.exit(1);
  }

  const globalDiagnostics = [...styleProgram.getGlobalDiagnostics()];
  if (globalDiagnostics.length > 0) {
    reportDiagnostics(globalDiagnostics);
    process.exit(1);
  }

  const declarationDiagnostics = [...styleProgram.getDeclarationDiagnostics()];
  if (declarationDiagnostics.length > 0) {
    reportDiagnostics(declarationDiagnostics);
    process.exit(1);
  }

  const configDiagnostics = [...styleProgram.getConfigFileParsingDiagnostics()];
  if (configDiagnostics.length > 0) {
    reportDiagnostics(configDiagnostics);
    process.exit(1);
  }

  const styles: Array<Promise<StyleDefinition>> = (results.emittedFiles || [])
    .filter((filename) => /\.(\w+\/){1}\w+\.js/.test(filename))
    .map((filename) => {
      return new Promise((resolve) => {
        import(`${absoluteRootDir}/${filename}`)
          .then((style: { default: StyleDefinition }) => {
            // JSON schema validation
            resolve(style.default);
          })
          .catch((error: string) => {
            throw new Error(`in ${filename}: ${error}`);
          });
      });
    });

  return Promise.all(styles);
};

export const buildStyle = ({
  states,
  basis,
  ...style
}: StyleDefinition): BuildStyleDefinition => {
  const buildContent: BuildStyleDefinition['content'] = states.reduce(
    (acc, { name, content }) => ({
      ...acc,
      [name]: content,
    }),
    { basis },
  );

  return { ...style, content: buildContent };
};

const isStyleDefinitionContentOverwrite = (
  overwrite: unknown | StyleDefinitionContentOverwrites[],
): overwrite is StyleDefinitionContentOverwrites[] => {
  return Array.isArray(overwrite);
};

export const buildReferenceStyle = (
  style: PrefabComponent['style'] | undefined,
): BuildStyle | undefined => {
  if (typeof style === 'undefined') {
    return undefined;
  }

  const { overwrite, name } = style;
  const nameObject = name ? { name } : {};
  if (typeof overwrite === 'undefined') {
    return { ...nameObject };
  }

  if (isStyleDefinitionContentOverwrite(overwrite)) {
    const buildOverwrite: BuildStyleDefinitionContentOverwrites =
      overwrite.reduce(
        (acc, { name: key, content }) => ({
          ...acc,
          [key]: content,
        }),
        {},
      );
    return { ...nameObject, overwrite: buildOverwrite };
  }

  return { ...nameObject, overwrite };
};
