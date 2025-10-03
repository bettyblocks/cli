import AdmZip from 'adm-zip';
import { Glob } from 'bun';
import { camel, title } from 'case';
import fs from 'fs-extra';
import path from 'path';

import {
  createCargoTomlFile,
  createlibRsFile,
  createWorldWitFile,
} from './createWasmDefinitionFiles';

interface Schema {
  label: string;
  [other: string]: unknown;
}

export interface FunctionDefinition {
  name: string;
  version: string;
  path: string;
  schema: Schema;
}

/* @doc functionDefinitionPath
  Expands the function dir with `function.json`.
*/
const functionDefinitionPath = (functionPath: string): string =>
  path.join(functionPath, 'function.json');

/* @doc functionImplementationPath
  Expands the function dir with `index.js`.
*/
const jsFunctionImplementationPath = (functionPath: string): string =>
  path.join(functionPath, 'index.js');

const wasmFunctionImplementationPath = (functionPath: string): string =>
  path.join(functionPath, 'wit', 'world.wit');

/* @doc isFunctionDefinition
  Checks the given functions dir for a file named function.json.
  Returns true if the file exists.
*/
const isFunctionDefinition = (functionPath: string): boolean =>
  fs.pathExistsSync(functionDefinitionPath(functionPath));

/* @doc isFunctionVersion
  Checks the given functions dir to be a function version.
  Returns true if applies to versioning conventions.
*/
const isFunctionVersion = (
  functionPath: string,
  functionsDir: string,
): boolean =>
  !!path.basename(functionPath).match(/^\d+\.\d+$/) &&
  parseFloat(path.basename(functionPath)) >= 1.0 &&
  path.dirname(path.dirname(functionPath)) === functionsDir;

/* @doc isFunction
  Checks the given functions dir for a file named index.js.
  Returns true if the file exists.
*/
const isFunction = (functionPath: string): boolean =>
  fs.pathExistsSync(jsFunctionImplementationPath(functionPath)) ||
  fs.pathExistsSync(wasmFunctionImplementationPath(functionPath));

/* @doc functionDirs
  Returns a list of directories inside the given functionsDir that have a function.json and index.js.
*/
// const functionDirs = (
//   functionsDir: string,
//   includeNonversioned = false,
// ): string[] =>
//   globSync(
//     path.join(functionsDir, '**', 'function.json').replace(/\\/g, '/'),
//   ).reduce<string[]>((dirs, functionDefinition) => {
//     const dir = path.dirname(functionDefinition).replace(/\//g, path.sep);
//     if (
//       isFunction(dir) &&
//       (includeNonversioned || isFunctionVersion(dir, functionsDir))
//     ) {
//       dirs.push(dir);
//     }
//     return dirs;
//   }, []);

const functionDirs = async (
  functionsDir: string,
  includeNonversioned = false,
): Promise<string[]> => {
  const glob = new Glob('**/function.json');
  const dirs: string[] = [];

  for await (const functionDefinition of glob.scanSync(
    path.join(functionsDir).replace(/\\/g, '/'),
  )) {
    const dir = path
      .dirname(path.join(functionsDir, functionDefinition))
      .replace(/\//g, path.sep);

    if (
      isFunction(dir) &&
      (includeNonversioned || isFunctionVersion(dir, functionsDir))
    ) {
      dirs.push(dir);
    }
  }
  return dirs;
};

/* @doc functionDefinition
  Reads the function.json from the given directory.
  Returns the parsed function.json as object.
*/
const functionDefinition = (
  functionPath: string,
  functionsDir: string,
): FunctionDefinition => {
  let name = '';
  let version = '';

  if (isFunctionVersion(functionPath, functionsDir)) {
    name = camel(path.basename(path.dirname(functionPath)));
    version = path.basename(functionPath);
  } else {
    name = camel(path.basename(functionPath));
  }

  const filePath = functionDefinitionPath(functionPath);
  const schema = fs.readJSONSync(filePath);

  try {
    return {
      name,
      path: filePath,
      schema,
      version,
    };
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

/* @doc functionDefinitions
  Returns an object containing all function.json definitions
  inside the given functionsDir, indexed by function name.
*/
const functionDefinitions = async (
  functionsDir: string,
  includeNonversioned = false,
): Promise<FunctionDefinition[]> => {
  const functionDirectories = await functionDirs(
    functionsDir,
    includeNonversioned,
  );

  return functionDirectories.map((functionDir) =>
    functionDefinition(functionDir, functionsDir),
  );
};

const stringifyDefinitions = (definitions: FunctionDefinition[]): string => {
  const updatedDefinitions = definitions.map(({ name, version, schema }) => ({
    name,
    version,
    ...schema,
    options: JSON.stringify(schema.options ?? []),
    paths: JSON.stringify(schema.paths ?? {}),
  }));

  return JSON.stringify(updatedDefinitions);
};

/* @doc newFunctionDefinition
  Creates a new folder for the given name and fills that folder with a function.json file
  and an index.js.
*/
const newFunctionDefinition = (
  functionsDir: string,
  functionName: string,
  isWasmFunctionProject: boolean,
): void => {
  const functionDir = path.join(functionsDir, functionName, '1.0');
  try {
    fs.mkdirpSync(functionDir);
    fs.writeJSONSync(
      functionDefinitionPath(functionDir),
      {
        category: 'Misc',
        description: 'Description',
        icon: { color: 'Orange', name: 'ActionsIcon' },
        label: title(functionName),
        options: [],
        yields: 'NONE',
      },
      { spaces: 2 },
    );

    if (isWasmFunctionProject) {
      createNewWasmFunction(functionDir, functionName);
    } else {
      createNewJsFunction(functionDir, functionName);
    }
  } catch (err) {
    throw new Error(`could not initialize new function ${functionDir}: ${err}`);
  }
};

const createNewJsFunction = (
  functionDir: string,
  functionName: string,
): void => {
  const functionDefName = functionName.replace(
    /-./g,
    (x) => x.toUpperCase()[1],
  );
  fs.writeFileSync(
    path.join(functionDir, 'index.js'),
    `const ${functionDefName} = async () => {\n\n}\n\nexport default ${functionDefName};`,
  );
};

const createNewWasmFunction = (
  functionDir: string,
  functionName: string,
): void => {
  createlibRsFile(functionDir, functionName);
  createWorldWitFile(functionDir, functionName);
  createCargoTomlFile(functionDir, functionName);
};

const toVariableName = ({ name, version }: FunctionDefinition): string =>
  `${camel(name)}_${version.replace('.', '_')}`;

/* @doc importFunctions
  Returns an array of strings, each item being an imported function:
  `import { default as functionName_1_0 } from './function-name/1.0';`;
*/
const importFunctions = (
  definitions: FunctionDefinition[],
  functionsPath: string,
): string[] =>
  definitions.map<string>(
    (definition) =>
      `import { default as ${toVariableName(definition)} } from '${path
        .dirname(
          definition.path.replace(
            functionsPath,
            `./${path.basename(functionsPath)}`,
          ),
        )
        .replace(/\\/g, '/')}';`,
  );

/* @doc exportFunctions
  Returns a string in which functions will be exported in an object;
*/
const exportFunctions = (definitions: FunctionDefinition[]): string[] => {
  const exports = definitions.map<string>((definition) => {
    const { name, version } = definition;
    return `  "${name} ${version}": ${toVariableName(definition)},`;
  });
  return ['const fn = {', ...exports, '};', '', 'export default fn;'];
};

/* @doc whitelistedFunctions
  Returns an array containing all functions based on the whitelist.
*/
const whitelistedFunctions = (
  definitions: FunctionDefinition[],
  whitelist: string[],
): FunctionDefinition[] =>
  whitelist.map((whitelisted) => {
    const definition = definitions.find(
      (def) => [def.name, def.version].join(' ') === whitelisted,
    );
    if (!definition)
      throw new Error(
        `Function ${whitelisted} could not be found. Check if function and version exists.`,
      );
    return definition;
  });

/* @doc generateIndex
  Fetches all functions and re-exports them. 
  Returns the result as a Buffer. 
*/
const generateIndex = async (
  functionsPath: string,
  whitelist?: string[],
): Promise<string> => {
  const definitions = await functionDefinitions(functionsPath);

  const functions = whitelist
    ? whitelistedFunctions(definitions, whitelist)
    : definitions;

  const code: string[] = [];
  code.push(...importFunctions(functions, functionsPath));
  code.push('');
  code.push(...exportFunctions(functions));
  code.push('');

  return code.join('\n');
};

/* @doc zipFunctionDefinitions
  Takes functionsPath as path to a directory with function definitions.
  Scans each directory for a function.json file, and if present adds it
  to the zip file. Generates an index.js and adds it to the zip file.
  Returns path to the zip file.
*/
const zipFunctionDefinitions = async (
  functionsPath: string,
  includes?: string[],
): Promise<string> => {
  const zip = new AdmZip();
  const tmpDir = '.tmp';
  const zipFilePath = path.join(tmpDir, 'app.zip');
  const cwd = path.dirname(functionsPath);

  fs.ensureDirSync(tmpDir);

  zip.addLocalFile(path.join(path.dirname(functionsPath), 'package.json'));
  zip.addFile('index.js', Buffer.from(await generateIndex(functionsPath)));
  zip.addLocalFolder(functionsPath, functionsPath.replace(cwd, ''));

  (includes ?? []).forEach((include) => {
    zip.addLocalFolder(path.join(cwd, include), include);
  });

  zip.writeZip(zipFilePath);

  return zipFilePath;
};

/* @doc getAllWasmFunctionsWithVersions
  Scans the given functionsPath for all functions that contain a wasm implementation.
  Returns an array of strings with function names and versions, e.g. ['my-function/1.0', 'my-function/2.0']
*/
export const getAllWasmFunctionsWithVersions = (
  functionsPath: string,
): string[] => {
  if (!fs.existsSync(functionsPath)) {
    return [];
  }
  return fs
    .readdirSync(functionsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .flatMap((dirent) => {
      const functionDir = path.join(functionsPath, dirent.name);
      if (!fs.existsSync(functionDir)) {
        return [];
      }
      return fs
        .readdirSync(functionDir, { withFileTypes: true })
        .filter((subDirent) => subDirent.isDirectory())
        .map((subDirent) => `${dirent.name}/${subDirent.name}`);
    });
};

export {
  functionDefinition,
  functionDefinitionPath,
  functionDefinitions,
  functionDirs,
  generateIndex,
  isFunctionDefinition,
  isFunctionVersion,
  newFunctionDefinition,
  stringifyDefinitions,
  whitelistedFunctions,
  zipFunctionDefinitions,
};
