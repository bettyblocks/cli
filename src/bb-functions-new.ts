import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import { newFunctionDefinition } from './functions/functionDefinitions';

const program = new Command();

program
  .argument('<function-name>', 'Name of the new function')
  .name('bb functions new')
  .parse(process.argv);

const {
  args: [inputFunctionName],
} = program;

const workingDir = process.cwd();
const isJsFunctionPorject = fs.existsSync(
  path.join(workingDir, '.app-functions'),
);
const isWasmFunctionProject = fs.existsSync(
  path.join(workingDir, '.wasm-functions'),
);

if (!isJsFunctionPorject && !isWasmFunctionProject) {
  throw new Error(
    `${workingDir} doesn't seem to be a functions project.\nPlease make sure you're in the root of the project.`,
  );
}

try {
  const functionsDir = path.join(workingDir, 'functions');
  newFunctionDefinition(functionsDir, inputFunctionName, isWasmFunctionProject);

  console.log(`functions/${inputFunctionName} created`);
} catch (error) {
  throw new Error(
    `functions/${inputFunctionName} could not be created. Error: ${error}`,
  );
}
