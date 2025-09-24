import chalk from 'chalk';
import { Command } from 'commander';
import path from 'path';

import Config from './functions/config';
import publishAppFunctions from './functions/publishAppFunctions';
import {
  FunctionValidator,
  logValidationResult,
} from './functions/validations';

const program = new Command();

program
  .name('bb functions publish')
  .option('--skip-compile', 'Skip the compilation of the application.')
  .parse(process.argv);

const { skipCompile } = program.opts();

const workingDir = process.cwd();

const baseFunctionsPath = path.join(workingDir, 'functions');

const config = new Config();

const validateFunctions = async (): Promise<{ valid: boolean }> => {
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();

  console.log(chalk.bold(`Validating functions in ${baseFunctionsPath}`));

  const results = await validator.validateFunctions();
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

  return { valid };
};

void (async (): Promise<void> => {
  const { valid } = await validateFunctions();

  if (valid) {
    await publishAppFunctions({ skipCompile });
  }
})();
