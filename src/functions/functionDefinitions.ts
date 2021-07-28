import fs from 'fs-extra';
import path from 'path';

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

const functionDefinition = (functionPath: string): object => {
  const filePath = functionDefinitionPath(functionPath);
  try {
    return fs.readJSONSync(filePath);
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

const functionDefinitions = (functionsDir: string): FunctionDefinitions => {
  const functionDirs = fs.readdirSync(functionsDir);

  return functionDirs.reduce(
    (definitions, functionPath) => {
      if (isFunctionDefinition(functionPath)) {
        const functionJson = functionDefinition(
          functionDefinitionPath(functionPath),
        ) as FunctionDefinition;

        return {
          [functionJson.name]: functionJson,
          ...definitions,
        };
      }

      return definitions;
    },
    {} as { [key: string]: FunctionDefinition },
  );
};

export {
  isFunctionDefinition,
  functionDefinitionPath,
  functionDefinition,
  functionDefinitions,
};
