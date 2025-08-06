import fs from 'fs-extra';
import path from 'path';
import { Command } from 'commander';
import prompts from 'prompts';
import AdmZip from 'adm-zip';
import chalk from 'chalk';

import {
  type Block,
  blockDefinitions,
  createPackageJson,
} from './blocks/blockDefinitions';
import {
  functionDefinitions,
  generateIndex,
  whitelistedFunctions,
} from './functions/functionDefinitions';
import publishBlocks from './blocks/publishBlocks';

import {
  validateBlockConfig,
  validateBlock,
} from './validations/function-block-validations';

const program = new Command();

program.option('--all').name('bb blocks publish').parse(process.argv);

const workingDir = process.cwd();
const baseBlocksPath = path.join(workingDir, 'blocks');
const blocks = blockDefinitions(baseBlocksPath);

const createBlockZip = (
  name: string,
  { functions, includes, dependencies }: Block,
) => {
  const zip = new AdmZip();
  const tmpDir = '.tmp';
  const zipFilePath = path.join(tmpDir, `${name}.zip`);

  fs.ensureDirSync(tmpDir);

  try {
    const functionsDir = path.join(workingDir, 'functions');
    const blocksDir = path.join(workingDir, 'blocks');
    const rootPackageJson = path.join(path.dirname(blocksDir), 'package.json');

    zip.addFile(
      'package.json',
      Buffer.from(createPackageJson(name, rootPackageJson, dependencies)),
    );
    zip.addFile(
      'index.js',
      Buffer.from(generateIndex(functionsDir, functions)),
    );

    const funcDefinitions = functionDefinitions(functionsDir);
    const blockFunctions = whitelistedFunctions(funcDefinitions, functions);

    blockFunctions.forEach((blockFunction) => {
      const functionDir = path.dirname(blockFunction.path);
      zip.addLocalFolder(functionDir, functionDir.replace(workingDir, ''));
    });

    includes.forEach((include) => {
      zip.addLocalFolder(path.join(workingDir, include), include);
    });

    zip.writeZip(zipFilePath);

    return zipFilePath;
  } catch (error) {
    throw new Error(`in ${name}: ${error}`);
  }
};

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  const choices = blocks.map((block) => ({
    title: path.basename(block, '.json'),
    value: block,
  }));
  const { all } = program.opts();

  let selected: string[] = [];

  if (all) {
    selected = blocks;
  } else {
    const results = (await prompts([
      {
        type: 'multiselect',
        name: 'selected',
        message: 'Which blocks do you want to publish?',
        choices,
        instructions: false,
      },
    ])) as { selected: string[] };
    selected = results.selected;
  }

  selected.forEach((jsonFile) => {
    // eslint-disable-next-line no-void
    void (async (): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const block: Block = fs.readJsonSync(jsonFile);
      const name = path.basename(jsonFile, '.json');
      if (validateBlockConfig(block)) {
        try {
          const functionsDir = path.join(workingDir, 'functions');
          const funcDefinitions = functionDefinitions(functionsDir);
          const blockFunctions = whitelistedFunctions(
            funcDefinitions,
            block.functions,
          );

          const { valid, errorMessage } = await validateBlock({
            blockFunctions,
            block,
            blockName: name,
          });

          if (valid) {
            const zip = createBlockZip(name, block);
            if (zip) await publishBlocks(block.functions, zip);
          } else {
            throw Error(chalk.red(`\n${errorMessage}\n`));
          }
        } catch (error) {
          throw new Error(`in ${name}: ${error}`);
        }
      } else {
        console.error(chalk.red(`\nFunctions can not be empty\n`));
      }
    })();
  });
})();
