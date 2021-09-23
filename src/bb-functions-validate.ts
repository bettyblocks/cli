/* npm dependencies */

import path from 'path';
import program from 'commander';

/* internal dependencies */

import {
  FunctionValidator,
  logValidationResult,
} from './functions/validations';
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

(async (): Promise<void> => {
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();

  if (inputFunctionName) {
    const result = await validator.validateFunction(inputFunctionName);
    logValidationResult(result);
  } else {
    const results = await validator.validateFunctions();
    results.forEach(result => logValidationResult(result));
  }
})();
