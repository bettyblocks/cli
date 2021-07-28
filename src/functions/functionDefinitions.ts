import fs from 'fs-extra';
import path from 'path';

export type FunctionDefinition = {
  name: string;
  [other: string]: unknown;
};

export type FunctionDefinitions = {
  [key: string]: FunctionDefinition;
};

const functionJsonPath = (functionPath: string): string =>
  path.join(functionPath, 'function.json');

const isFunction = (functionPath: string): boolean =>
  fs.pathExistsSync(functionJsonPath(functionPath));

const fetchFunction = (functionPath: string): object => {
  const filePath = functionJsonPath(functionPath);
  try {
    return fs.readJSONSync(filePath);
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

const functionDefinitions = (functionsDir: string): FunctionDefinitions => {
  const functionDirs = fs.readdirSync(functionsDir);

  return functionDirs.reduce(
    (definitions, functionDir) => {
      if (isFunction(functionDir)) {
        const functionJson = fetchFunction(
          functionJsonPath(functionDir),
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

export { isFunction, fetchFunction, functionJsonPath, functionDefinitions };
