/* eslint-disable camelcase,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
/* npm dependencies */

import fs from 'fs-extra';
import path from 'path';
import program from 'commander';
import prompts from 'prompts';
import AdmZip from 'adm-zip';

/* internal dependencies */

import {
  Block,
  blockDefinitions,
  createPackageJson,
} from './blocks/blockDefinitions';
import {
  FunctionDefinition,
  functionDefinitions,
  generateIndex,
  whitelistedFunctions,
} from './functions/functionDefinitions';
import publishBlocks from './blocks/publishBlocks';
import Config from './functions/config';
import {
  FunctionValidator,
  logValidationResult,
} from './functions/validations';

program.name('bb blocks publish').parse(process.argv);

const workingDir = process.cwd();
const baseBlocksPath = path.join(workingDir, 'blocks');
const blocks = blockDefinitions(baseBlocksPath);
const validateBlockConfig = (block: Block) => !!block.functions.length;

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
  } catch ({ message }) {
    return console.error(message);
  }
};

const validateFunctions = async (
  blockFunctions: FunctionDefinition[],
): Promise<boolean> => {
  const baseFunctionsPath = path.join(workingDir, 'functions');
  console.log(`Validating functions in ${baseFunctionsPath}`);
  const config = new Config();
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();
  const results = await validator.validateFunctions('', blockFunctions);
  let valid = true;
  results.forEach((result) => {
    if (result.status === 'error') {
      valid = false;
    }
    logValidationResult(result);
  });

  return valid;
};

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  const choices = blocks.map((block) => ({
    title: path.basename(block, '.json'),
    value: block,
  }));
  const { selected } = (await prompts([
    {
      type: 'multiselect',
      name: 'selected',
      message: 'Which blocks do you want to publish?',
      choices,
      instructions: false,
    },
  ])) as { selected: string[] };

  selected.forEach((jsonFile) => {
    // eslint-disable-next-line no-void
    void (async (): Promise<void> => {
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
          const valid = await validateFunctions(blockFunctions);
          if (valid) {
            const zip = createBlockZip(name, block);
            if (zip) await publishBlocks(block.functions, zip);
          } else {
            console.error('Some functions are not valid');
          }
        } catch ({ message }) {
          console.error(message);
        }
      } else {
        console.log(`Cannot publish invalid block ${name}`);
      }
    })();
  });
})();
