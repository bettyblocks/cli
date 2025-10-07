import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import { validateFunctions } from './functions/validateFunctions';

const program = new Command();

program
  .name('bb functions validate')
  .argument('[function-name]', 'Name of the function to validate')
  .parse(process.argv);

const {
  args: [inputFunctionName],
} = program;

const workingDir = process.cwd();
const baseFunctionsPath = path.join(workingDir, 'functions');

const isWasmFunctionProject = fs.existsSync(
  path.join(workingDir, '.wasm-functions'),
);

void (async (): Promise<void> => {
  validateFunctions(
    isWasmFunctionProject,
    baseFunctionsPath,
    inputFunctionName,
  );
})();
