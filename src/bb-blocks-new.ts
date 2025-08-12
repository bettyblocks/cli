import { kebab } from 'case';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import { newBlockDefinition } from './blocks/blockDefinitions';

const program = new Command();

program.usage('[block-name]').name('bb blocks new').parse(process.argv);

const { args } = program;
const inputBlockName = kebab(args.join());

const workingDir = process.cwd();
if (fs.existsSync(path.join(workingDir, '.app-functions'))) {
  try {
    const blocksDir = path.join(workingDir, 'blocks');
    console.log(newBlockDefinition(blocksDir, inputBlockName));
  } catch (err) {
    console.log(
      `blocks/${inputBlockName}.json could not be created. Error: ${err}`,
    );
  }
} else {
  console.log(
    `${workingDir} doesn't seem to be a functions project.\nPlease make sure you're in the root of the project.`,
  );
}
