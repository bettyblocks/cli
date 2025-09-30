import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

import Config from './functions/config';
import { getAllWasmFunctionsWithVersions } from './functions/functionDefinitions';
import publishAppFunctions from './functions/publishAppFunctions';
import { publishWasmBlockStoreFunctions } from './functions/publishWasmBlockStoreFunctions';
import {
  FunctionValidator,
  logValidationResult,
} from './functions/validations';

const program = new Command();

program
  .name('bb functions publish')
  .option('--skip-compile', 'Skip the compilation of the application.')
  .option(
    '-a, --all',
    'Publish all wasm functions, this only applies to wasm functions projects.',
  )
  .parse(process.argv);

const { skipCompile, all } = program.opts();

const workingDir = process.cwd();

const baseFunctionsPath = path.join(workingDir, 'functions');

const config = new Config();

const isWasmFunctionProject = fs.existsSync(
  path.join(workingDir, '.wasm-functions'),
);

const validateFunctions = async (
  isWasmFunctionProject: boolean,
): Promise<{ valid: boolean }> => {
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

void (async (): Promise<void> => {
  const { valid } = await validateFunctions(isWasmFunctionProject);

  if (!valid) {
    process.exit(1);
  }

  if (isWasmFunctionProject) {
    const functionNames = getAllWasmFunctionsWithVersions(baseFunctionsPath);
    const choices = functionNames.map((name) => ({
      title: name,
      value: name,
    }));

    let selected: string[] = [];
    if (all) {
      selected = functionNames;
    } else {
      const results = (await prompts([
        {
          choices,
          instructions: false,
          message: 'Which wasm functions do you want to publish?',
          name: 'selected',
          type: 'multiselect',
        },
      ])) as { selected: string[] };
      ({ selected } = results);
    }

    await publishWasmBlockStoreFunctions(baseFunctionsPath, selected);
  } else {
    await publishAppFunctions({ skipCompile });
  }
})();
