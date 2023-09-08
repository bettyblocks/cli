/* eslint-disable camelcase,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
/* npm dependencies */

import fs from 'fs-extra';

import path from 'path';
import program from 'commander';

/* internal dependencies */

import chalk from 'chalk';
import publishAppFunctions from './functions/publishAppFunctions';
import publishCustomFunctions from './functions/publishCustomFunctions';

import {
  FunctionValidator,
  logValidationResult,
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

const baseFunctionsPath = path.join(workingDir, 'functions');

const config = new Config();

const validateFunctions = async () => {
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

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  if (fs.existsSync(path.join(workingDir, '.app-functions'))) {
    const { valid } = await validateFunctions();

    if (valid) {
      await publishAppFunctions({ skipCompile });
    }
  } else {
    publishCustomFunctions(host, bump, skip);
  }
})();
