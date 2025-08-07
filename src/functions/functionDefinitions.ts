import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import glob from 'glob';
import { concat } from 'lodash';
import camelCase from 'lodash/camelCase';
import startCase from 'lodash/startCase';
import path from 'path';

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
const functionImplementationPath = (functionPath: string): string =>
  path.join(functionPath, 'index.js');

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
  fs.pathExistsSync(functionImplementationPath(functionPath));

/* @doc functionDirs
  Returns a list of directories inside the given functionsDir that have a function.json and index.js.
*/
const functionDirs = (
  functionsDir: string,
  includeNonversioned = false,
): string[] =>
  glob
    .sync(path.join(functionsDir, '**', 'function.json').replace(/\\/g, '/'))
    .reduce((dirs, functionDefinition) => {
      const dir = path.dirname(functionDefinition).replace(/\//g, path.sep);
      if (
        isFunction(dir) &&
        (includeNonversioned || isFunctionVersion(dir, functionsDir))
      ) {
        dirs.push(dir);
      }
      return dirs;
    }, [] as string[]);

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
    name = camelCase(path.basename(path.dirname(functionPath)));
    version = path.basename(functionPath);
  } else {
    name = camelCase(path.basename(functionPath));
  }

  const filePath = functionDefinitionPath(functionPath);
  const schema = fs.readJSONSync(filePath) as Schema;

  try {
    return {
      name,
      version,
      path: filePath,
      schema,
    } as FunctionDefinition;
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

/* @doc functionDefinitions
  Returns an object containing all function.json definitions
  inside the given functionsDir, indexed by function name.
*/
const functionDefinitions = (
  functionsDir: string,
  includeNonversioned = false,
): FunctionDefinition[] =>
  functionDirs(functionsDir, includeNonversioned).map((functionDir) =>
    functionDefinition(functionDir, functionsDir),
  );

const stringifyDefinitions = (definitions: FunctionDefinition[]): string => {
  const updatedDefinitions = definitions.map(({ name, version, schema }) => ({
    name,
    version,
    ...schema,
    options: JSON.stringify(schema.options || []),
    paths: JSON.stringify(schema.paths || {}),
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
): void => {
  const functionDefName = functionName.replace(
    /-./g,
    (x) => x.toUpperCase()[1],
  );
  const functionDir = path.join(functionsDir, functionName, '1.0');
  try {
    fs.mkdirpSync(functionDir);
    fs.writeJSONSync(
      functionDefinitionPath(functionDir),
      {
        description: 'Description',
        label: startCase(functionName),
        category: 'Misc',
        icon: {
          name: 'ActionsIcon',
          color: 'Orange',
        },
        options: [],
        yields: 'NONE',
      },
      { spaces: 2 },
    );

    fs.writeFileSync(
      path.join(functionDir, 'index.js'),
      `const ${functionDefName} = async () => {\n\n}\n\nexport default ${functionDefName};`,
    );
  } catch (err) {
    throw new Error(`could not initialize new function ${functionDir}: ${err}`);
  }
};

const toVariableName = ({ name, version }: FunctionDefinition): string =>
  `${camelCase(name)}_${version.replace('.', '_')}`;

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
      (def) => concat(def.name, def.version).join(' ') === whitelisted,
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
const generateIndex = (functionsPath: string, whitelist?: string[]): string => {
  const definitions = functionDefinitions(functionsPath);

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
const zipFunctionDefinitions = (
  functionsPath: string,
  includes?: string[],
): string => {
  const zip = new AdmZip();
  const tmpDir = '.tmp';
  const zipFilePath = path.join(tmpDir, 'app.zip');
  const cwd = path.dirname(functionsPath);

  fs.ensureDirSync(tmpDir);

  zip.addLocalFile(path.join(path.dirname(functionsPath), 'package.json'));
  zip.addFile('index.js', Buffer.from(generateIndex(functionsPath)));
  zip.addLocalFolder(functionsPath, functionsPath.replace(cwd, ''));

  (includes || []).forEach((include) => {
    zip.addLocalFolder(path.join(cwd, include), include);
  });

  zip.writeZip(zipFilePath);

  return zipFilePath;
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
