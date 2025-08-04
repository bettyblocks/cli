import chalk from 'chalk';
import path from 'path';
import { Command } from 'commander';

import {
  FunctionValidator,
  logValidationResult,
} from './functions/validations';

import Config from './functions/config';

const program = new Command();

program
  .usage('[function-name]')
  .name('bb functions validate')
  .parse(process.argv);

const {
  args: [inputFunctionName],
} = program;

const workingDir = process.cwd();
const baseFunctionsPath = path.join(workingDir, 'functions');

const config = new Config();

const validateFunctions = async () => {
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();

  console.log(chalk.bold(`Validating functions in ${baseFunctionsPath}`));

  const results = await validator.validateFunctions(inputFunctionName);
  results.forEach(logValidationResult);

  const valid = results.every((result) => result.status === 'ok');

  if (valid) {
    console.log(
      `\n${chalk.green.underline(
        `✔ All your functions are valid and ready to be published!`,
      )}`,
    );
  } else {
    console.log(
      `\n${chalk.red.underline(
        `✖ Certain functions in your project are invalid.`,
      )}`,
    );
  }
};

// eslint-disable-next-line no-void
void (async (): Promise<void> => validateFunctions())();
