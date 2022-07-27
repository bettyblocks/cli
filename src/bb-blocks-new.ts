import program from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { newBlockDefinition } from './blocks/blockDefinitions';

/* process arguments */
program.usage('[block-name]').name('bb blocks new').parse(process.argv);

const {
  args: [inputBlockName],
} = program;

const workingDir = process.cwd();
if (fs.existsSync(path.join(workingDir, '.app-functions'))) {
  try {
    const blocksDir = path.join(workingDir, 'blocks');
    console.log(newBlockDefinition(blocksDir, inputBlockName));
  } catch (err) {
    console.log(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `blocks/${inputBlockName}.json could not be created. Error: ${err}`,
    );
  }
} else {
  console.log(
    `${workingDir} doesn't seem to be a functions project.\nPlease make sure you're in the root of the project.`,
  );
}
