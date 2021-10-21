import AdmZip from 'adm-zip';
import camelCase from 'lodash/camelCase';
import fs from 'fs-extra';
import path from 'path';

export type FunctionDefinition = {
  path: string;
  schema: {
    name: string;
    [other: string]: unknown;
  };
};

/* @doc functionDefinitionPath
  Expands the function dir with `function.json`.
*/
const functionDefinitionPath = (functionPath: string): string =>
  path.join(functionPath, 'function.json');

/* @doc pathToFunction
  Expands the function dir with `index.js`.
*/
const pathToFunction = (functionDir: string): string =>
  path.join(functionDir, 'index.js');

/* @doc isFunctionDefinition
  Checks the given functions dir for a file named function.json.
  Returns true if the file exists.
*/
const isFunctionDefinition = (functionPath: string): boolean =>
  fs.pathExistsSync(functionDefinitionPath(functionPath));

/* @doc isFunction
  Checks the given functions dir for a file named index.js.
  Returns true if the file exists.
*/
const isFunction = (functionDir: string): boolean =>
  fs.pathExistsSync(pathToFunction(functionDir));

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
const functionDefinition = (functionPath: string): FunctionDefinition => {
  const filePath = functionDefinitionPath(functionPath);
  try {
    return {
      path: filePath,
      schema: fs.readJSONSync(filePath),
    } as FunctionDefinition;
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

/* @doc functionDefinitions
  Returns an object containing all function.json definitions
  inside the given functionsDir, indexed by function name.
*/
const functionDefinitions = (functionsDir: string): FunctionDefinition[] => {
  return functionDirs(functionsDir).map(
    functionDir => functionDefinition(functionDir) as FunctionDefinition,
  );
};

const stringifyDefinitions = (definitions: FunctionDefinition[]): string => {
  const updatedDefinitions = definitions.reduce((acc, { schema }) => {
    return {
      ...acc,
      [schema.name]: {
        ...schema,
        options: JSON.stringify(schema.options),
      },
    };
  }, {});

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
  const functionDefName = functionName.replace(/-./g, x => x.toUpperCase()[1]);
  const functionDir = path.join(functionsDir, functionName);
  try {
    fs.mkdirpSync(functionDir);
    fs.writeJSONSync(
      functionDefinitionPath(functionDir),
      {
        name: functionDefName,
        description: 'Description',
        label: functionName,
        category: 'Misc',
        icon: 'CreateIcon',
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

/* @doc fetchFunctions
  Fetches all functions in the `/functions` folder, only includes function that
  have both an `index.js` and `functions.json` file.
  Returns an array of function names.
*/
const fetchFunctions = (functionsDir: string): string[] =>
  fs.readdirSync(functionsDir).reduce<string[]>((names, name) => {
    const functionPath = path.join(functionsDir, name);
    if (isFunction(functionPath) && isFunctionDefinition(functionPath)) {
      names.push(name);
    }

    return names;
  }, []);

/* @doc reExportFunctions
  Returns an array of strings, each item being a re-exported function:
  `export { default as functionName } from './function-name';
 */
const reExportFunctions = (functions: string[]): string[] =>
  functions.reduce<string[]>((exportedFunctions, file) => {
    exportedFunctions.push(
      `export { default as ${camelCase(file)} } from './${file}';`,
    );

    return exportedFunctions;
  }, []);

/* @doc generateIndex
  Fetches all functions and re-exports them. 
  Returns the result as a Buffer. 
*/
const generateIndex = (): Buffer => {
  const functions = fetchFunctions(path.join(process.cwd(), 'functions'));
  const code = reExportFunctions(functions).join('\n');

  return Buffer.from(code);
};

/* @doc zipFunctionDefinitions
  Takes functionsDir as path to a directory with function definitions.
  Scans each directory for a function.json file, and if present adds it
  to the zip file. Generates an index.js and adds it to the zip file.
  Returns path to the zip file.
 */
const zipFunctionDefinitions = (functionsDir: string): string => {
  const zip = new AdmZip();
  const tmpDir = '.tmp';
  const zipFilePath = `${tmpDir}/app.zip`;

  fs.ensureDirSync(tmpDir);

  zip.addLocalFile(path.join(process.cwd(), 'package.json'));
  zip.addFile('index.js', generateIndex());
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
  newFunctionDefinition,
  stringifyDefinitions,
  zipFunctionDefinitions,
};
