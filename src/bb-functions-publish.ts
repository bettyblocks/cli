/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import program from 'commander';

/* internal dependencies */

import publishAppFunctions from './functions/publishAppFunctions';
import publishCustomFunctions from './functions/publishCustomFunctions';
import { FunctionValidator, ValidationResult } from './functions/validations';
import Config from './functions/config';

/* process arguments */

program
  .name('bb functions publish')
  .option('-b, --bump', 'Bump the revision number.')
  .option('-s, --skip', 'Skip building the custom functions bundle.')
  .option(
    '-h, --host <host>',
    'Set hostname to publish to. Defaults to <identifier>.bettyblocks.com',
  )
  .parse(process.argv);

const bumpRevision = program.bump;
const skipBuild = program.skip;
const { host } = program;

/* execute command */

const workingDir = process.cwd();

const logResult = ({
  status,
  functionName,
  errors,
}: ValidationResult): void => {
  if (status === 'ok') {
    const mark = chalk.green(`✔`);
    console.log(`${mark} Validated: ${functionName}`);
  } else {
    const msg = chalk.red(`${errors}`);
    const mark = chalk.red(`✖`);
    console.log(`${mark} Validated: ${functionName}\n\t${msg}`);
  }
};

const validateFunctions = async (): Promise<boolean> => {
  const baseFunctionsPath = path.join(workingDir, 'functions');
  console.log(`Validating functions in ${baseFunctionsPath}`);

  const config = new Config();
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();
  const results = await validator.validateFunctions();

  let validated = true;
  results.forEach(result => {
    if (result.status === 'error') {
      validated = false;
    }
    logResult(result);
  });

  return validated;
};

(async (): Promise<void> => {
  if (fs.existsSync(path.join(workingDir, '.app-functions'))) {
    const validated = await validateFunctions();

    if (validated) {
      publishAppFunctions();
    } else {
      console.log(
        `${chalk.red(
          `✖`,
        )} Could not publish. Please make sure all functions are valid.`,
      );
    }
  } else {
    publishCustomFunctions(host, bumpRevision, skipBuild);
  }
})();
