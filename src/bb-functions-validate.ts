/* npm dependencies */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import program from 'commander';
import { Validator } from 'jsonschema';

/* internal dependencies */

import {
  fetchFunction,
  functionValidator,
  validateFunction,
} from './utils/validateFunction';

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

const validateFunctionByName = async (
  functionName: string,
  validator: Validator,
): Promise<void> => {
  const functionPath = path.join(baseFunctionsPath, functionName);
  const json = await fetchFunction(functionPath);
  validateFunction(json, validator).then(
    ({ status, functionName: name, errors }) => {
      if (status === 'ok') {
        const mark = chalk.green(`√`);
        console.log(`${mark} Validated: ${name}`);
      } else {
        const msg = chalk.red(`${errors}`);
        const mark = chalk.red(`x`);
        console.log(`${mark} Validated: ${name}\n\t${msg}`);
      }
    },
  );
};

(async (): Promise<void> => {
  const validator = await functionValidator();
  if (inputFunctionName) {
    validateFunctionByName(inputFunctionName, validator);
  } else {
    fs.readdirSync(baseFunctionsPath).forEach(functionDir => {
      validateFunctionByName(functionDir, validator);
    });
  }
})();
