import chalk from 'chalk';

import Config from './config';
import { FunctionValidator, logValidationResult } from './validations';

export const validateFunctions = async (
  isWasmFunctionProject: boolean,
  baseFunctionsPath: string,
): Promise<{ valid: boolean }> => {
  const config = new Config();
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();

  console.log(chalk.bold(`Validating functions in ${baseFunctionsPath}`));

  const results = await validator.validateFunctions({ isWasmFunctionProject });
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
