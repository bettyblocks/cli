import fs from 'fs-extra';
import path from 'path';

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
        functions: [],
        include: [],
      },
      { spaces: 2 },
    );
    return `blocks/${blockName}.json created`;
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`could not initialize new block ${blocksDir}: ${err}`);
  }
};

export { newBlockDefinition };
