/* npm dependencies */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import program from 'commander';
import { Validator } from 'jsonschema';

/* internal dependencies */

import {
  isFunction,
  fetchFunction,
  functionJsonPath,
} from './functions/functionDefinitions';

import {
  Config,
  functionValidator,
  validateFunction,
} from './functions/validations';

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

const config = fs.readJSONSync(
  path.join(process.cwd(), 'config.json'),
) as Config;

const validateFunctionByName = async (
  functionPath: string,
  validator: Validator,
): Promise<void> => {
  const json = fetchFunction(functionPath);
  const { status, functionName: name, errors } = await validateFunction(
    json,
    validator,
  );

  if (status === 'ok') {
    const mark = chalk.green(`√`);
    console.log(`${mark} Validated: ${name}`);
  } else {
    const msg = chalk.red(`${errors}`);
    const mark = chalk.red(`x`);
    console.log(`${mark} Validated: ${name}\n\t${msg}`);
  }
};

(async (): Promise<void> => {
  const validator = await functionValidator(config);
  if (inputFunctionName) {
    const functionPath = path.join(baseFunctionsPath, inputFunctionName);
    if (isFunction(functionPath)) {
      validateFunctionByName(functionPath, validator);
    } else {
      console.log(
        `${chalk.red(
          `x`,
        )} Error: Function not found, missing ${functionJsonPath(
          functionPath,
        )}.`,
      );
    }
  } else {
    fs.readdirSync(baseFunctionsPath).forEach(functionDir => {
      const functionPath = path.join(baseFunctionsPath, functionDir);
      if (isFunction(functionPath)) {
        validateFunctionByName(functionPath, validator);
      }
    });
  }
})();
