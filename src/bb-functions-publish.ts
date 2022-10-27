/* eslint-disable camelcase,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
/* npm dependencies */

import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import program from 'commander';

/* internal dependencies */

import { functionDefinitions } from './functions/functionDefinitions';
import publishAppFunctions from './functions/publishAppFunctions';
import publishCustomFunctions from './functions/publishCustomFunctions';
import {
  FunctionValidator,
  logValidationResult,
  ValidationResult,
} from './functions/validations';
import Config from './functions/config';

/* process arguments */

program
  .name('bb functions publish')
  .option('-b, --bump', 'Bump the revision number.')
  .option('-s, --skip', 'Skip building the custom functions bundle.')
  .option('--skip-compile', 'Skip the compilation of the application.')
  .option(
    '-h, --host <host>',
    'Set hostname to publish to. Defaults to <identifier>.bettyblocks.com',
  )
  .parse(process.argv);

const { host, skip, bump, skipCompile } = program;

/* execute command */

const workingDir = process.cwd();

const validateFunctions = async (): Promise<{
  valid: boolean;
  results: ValidationResult[];
}> => {
  const baseFunctionsPath = path.join(workingDir, 'functions');
  console.log(`Validating functions in ${baseFunctionsPath}`);

  const config = new Config();
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();
  const results = await validator.validateFunctions();

  let valid = true;
  results.forEach((result) => {
    if (result.status === 'error') {
      valid = false;
    }
    logValidationResult(result);
  });

  return { valid, results };
};

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  if (fs.existsSync(path.join(workingDir, '.app-functions'))) {
    const { valid, results } = await validateFunctions();

    if (valid) {
      await publishAppFunctions({ skipCompile });
    } else if (
      results.some(
        ({ errors }) =>
          errors &&
          errors.some(
            ({ stack }) => stack === 'instance.icon is not of a type(s) object',
          ),
      )
    ) {
      console.log(
        `Maybe auto-convert your function icons using ${chalk.cyan(
          'bb functions converticons',
        )}?`,
      );
    } else {
      const baseFunctionsPath = path.join(workingDir, 'functions');
      const allFunctions = functionDefinitions(baseFunctionsPath, true);
      const versionedFunctions = functionDefinitions(baseFunctionsPath);
      console.log('blablabla');
      if (allFunctions.length !== versionedFunctions.length) {
        console.log(
          `Maybe auto-version your functions without a version number using ${chalk.cyan(
            'bb functions autoversion',
          )}?`,
        );
      }
    }
  } else {
    publishCustomFunctions(host, bump, skip);
  }
})();
