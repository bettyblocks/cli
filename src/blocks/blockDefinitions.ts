import { Glob } from 'bun';
import fs from 'fs-extra';
import path from 'path';

import { pick } from '../utils/pick';

export interface Block {
  dependencies: string[];
  functions: string[];
  includes: string[];
}

interface RootPackageJson {
  dependencies: Record<string, string>;
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
      dependencies: rootDependencies,
      name,
      private: 'true',
      version: '1.0.0',
    },
    null,
    2,
  );

  return packageJson;
};

/* @doc functionDirs
  Returns a list of blocks.
*/
const blockFiles = async (blockDir: string): Promise<string[]> => {
  const glob = new Glob('*.json');
  const matches: string[] = [];

  for await (const file of glob.scan(path.join(blockDir).replace(/\\/g, '/'))) {
    matches.push(path.join(blockDir, file));
  }

  return matches;
};

/* @doc blockDefinitions
  Returns an array containing all block definitions
  inside the given blocksDir.
*/
const blockDefinitions = async (blocksDir: string): Promise<string[]> => {
  const files = await blockFiles(blocksDir);
  return files.map((blocks) => blocks);
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
    throw new Error(`could not initialize new block ${blocksDir}: ${err}`);
  }
};

export {
  blockDefinitionPath,
  blockDefinitions,
  createPackageJson,
  newBlockDefinition,
};
