/* npm dependencies */

import chalk from 'chalk';
import path from 'path';
import program from 'commander';

/* internal dependencies */

import { FunctionValidator, ValidationResult } from './functions/validations';
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

const logResult = ({
  path: functionPath,
  status,
  functionName,
  errors,
}: ValidationResult): void => {
  if (status === 'ok') {
    const mark = chalk.green(`✔`);
    console.log(`${mark} Validate: ${functionName}`);
  } else {
    const msg = chalk.red(`${errors}`);
    const mark = chalk.red(`✖`);
    console.log(`${mark} Validate: ${functionName || functionPath}\n\t${msg}`);
  }
};

(async (): Promise<void> => {
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();

  if (inputFunctionName) {
    const result = await validator.validateFunction(inputFunctionName);
    logResult(result);
  } else {
    const results = await validator.validateFunctions();
    results.forEach(result => logResult(result));
  }
})();
