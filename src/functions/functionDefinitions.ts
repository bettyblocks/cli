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

/* @doc functionDefinitionPath
  Expands the function dir with `function.json`.
*/
const functionDefinitionPath = (functionPath: string): string =>
  path.join(functionPath, 'function.json');

/* @doc isFunctionDefinition
  Checks the given functions dir for a file named function.json.
  Returns true if the file exists.
*/
const isFunctionDefinition = (functionPath: string): boolean =>
  fs.pathExistsSync(functionDefinitionPath(functionPath));

/* @doc functionDirs
  Returns a list of directories inside the given functionsDir that have a function.json.
*/
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

/* @doc functionDefinition
  Reads the function.json from the given directory.
  Returns the parsed function.json as object.
*/
const functionDefinition = (functionPath: string): object => {
  const filePath = functionDefinitionPath(functionPath);
  try {
    return fs.readJSONSync(filePath);
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

/* @doc functionDefinitions
  Returns an object containing all function.json definitions
  inside the given functionsDir, indexed by function name.
*/
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

/* @doc zipFunctionDefinitions
  Takes functionsDir as path to a directory with function definitions.
  Scans each directory for a function.json file, and if present adds it
  to the zip file.
  Returns path to the zip file.
 */
const zipFunctionDefinitions = (functionsDir: string): string => {
  const zip = new AdmZip();
  const tmpDir = '.tmp';
  const zipFilePath = `${tmpDir}/app.zip`;

  fs.ensureDirSync(tmpDir);

  zip.addLocalFile(path.join(process.cwd(), 'package.json'));
  zip.addLocalFolder(functionsDir);

  zip.writeZip(zipFilePath);

  return zipFilePath;
};

export {
  functionDirs,
  functionDefinitionPath,
  functionDefinition,
  functionDefinitions,
  isFunctionDefinition,
  zipFunctionDefinitions,
};
