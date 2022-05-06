/* npm dependencies */

import chalk from 'chalk';
import path from 'path';
import program from 'commander';

/* internal dependencies */

import {
  FunctionValidator,
  logValidationResult,
} from './functions/validations';

import { functionDefinitions } from './functions/functionDefinitions';

import Config from './functions/config';

/* process arguments */
program
  .usage('[function-name]')
  .name('bb functions validate')
  .parse(process.argv);

const {
  args: [inputFunctionName],
} = program;
/* execute command */

const workingDir = process.cwd();
const baseFunctionsPath = path.join(workingDir, 'functions');

const config = new Config();

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();

  const results = await validator.validateFunctions(inputFunctionName);
  results.forEach(logValidationResult);

  const allFunctions = functionDefinitions(baseFunctionsPath, true);
  const versionedFunctions = functionDefinitions(baseFunctionsPath);

  if (allFunctions.length !== versionedFunctions.length) {
    console.log(
      `Maybe auto-version your functions without a version number using ${chalk.cyan(
        'bb functions autoversion',
      )}?`,
    );
  }
})();
