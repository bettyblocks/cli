import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';

export type FunctionDefinition = {
  name: string;
  [other: string]: unknown;
};

export type FunctionDefinitions = {
  [key: string]: FunctionDefinition;
};

const functionDefinitionPath = (functionPath: string): string =>
  path.join(functionPath, 'function.json');

const isFunctionDefinition = (functionPath: string): boolean =>
  fs.pathExistsSync(functionDefinitionPath(functionPath));

const functionDirs = (functionsDir: string): string[] =>
  fs.readdirSync(functionsDir).reduce(
    (dirs, functionDir) => {
      const functionPath = path.join(functionsDir, functionDir);
      if (isFunctionDefinition(functionPath)) {
        dirs.push(functionPath);
      }

      return dirs;
    },
    [] as string[],
  );

const functionDefinition = (functionPath: string): object => {
  const filePath = functionDefinitionPath(functionPath);
  try {
    return fs.readJSONSync(filePath);
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

const functionDefinitions = (functionsDir: string): FunctionDefinitions => {
  return functionDirs(functionsDir).reduce(
    (definitions, functionDir) => {
      const functionJson = functionDefinition(
        functionDir,
      ) as FunctionDefinition;

      return {
        [functionJson.name]: functionJson,
        ...definitions,
      };
    },
    {} as FunctionDefinitions,
  );
};

const zipFunctionDefinitions = (functionsDir: string): string => {
  const zip = new AdmZip();
  const tmpDir = '.tmp';
  const zipFile = `${tmpDir}/app.zip`;

  fs.ensureDirSync(tmpDir);

  functionDirs(functionsDir).forEach(functionDir => {
    zip.addLocalFolder(functionDir);
  });

  zip.writeZip(zipFile);

  return zipFile;
};

export {
  functionDirs,
  functionDefinitionPath,
  functionDefinition,
  functionDefinitions,
  isFunctionDefinition,
  zipFunctionDefinitions
};
