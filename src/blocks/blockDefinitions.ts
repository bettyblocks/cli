import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import { pick } from 'lodash';

export interface Block {
  dependencies: string[];
  functions: string[];
  includes: string[];
}

interface RootPackageJson {
  dependencies: { [key: string]: string };
}

/* @doc createPackageJson
  Returns an object containing all data needed for the block package json
*/
const createPackageJson = (
  name: string,
  rootPackageJson: string,
  dependencies: string[],
): string => {
  const rootDependencies = pick(
    (fs.readJsonSync(rootPackageJson) as RootPackageJson).dependencies,
    dependencies,
  );
  const packageJson = JSON.stringify(
    {
      name,
      version: '1.0.0',
      private: 'true',
      dependencies: rootDependencies,
    },
    null,
    2,
  );

  return packageJson;
};

/* @doc functionDirs
  Returns a list of blocks.
*/
const blockFiles = (blockDir: string): string[] => {
  return glob
    .sync(path.join(blockDir, '*.json').replace(/\\/g, '/'))
    .reduce((blocks, blockDefinition) => {
      blocks.push(blockDefinition);
      return blocks;
    }, [] as string[]);
};

/* @doc blockDefinitions
  Returns an array containing all block definitions
  inside the given blocksDir.
*/
const blockDefinitions = (blocksDir: string): string[] => {
  return blockFiles(blocksDir).map((blocks) => blocks);
};

/* @doc blockDefinitionPath
  Expands the block dir with a json file with the given blockname.
*/
const blockDefinitionPath = (blockPath: string, blockName: string): string =>
  path.join(blockPath, `${blockName}.json`);

/* @doc newBlockDefinition
  If block does not exists it will create a new json file with the given blockname.
*/
const newBlockDefinition = (blocksDir: string, blockName: string): string => {
  try {
    const existingBlock = fs.existsSync(
      blockDefinitionPath(blocksDir, blockName),
    );

    if (existingBlock) return 'Block already exists';
    fs.mkdirpSync(blocksDir);
    fs.writeJSONSync(
      blockDefinitionPath(blocksDir, blockName),
      {
        dependencies: [],
        functions: [],
        includes: [],
      },
      { spaces: 2 },
    );
    return `blocks/${blockName}.json created`;
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`could not initialize new block ${blocksDir}: ${err}`);
  }
};

export {
  blockDefinitions,
  blockDefinitionPath,
  createPackageJson,
  newBlockDefinition,
};
