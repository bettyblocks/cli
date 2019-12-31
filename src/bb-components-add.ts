/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { outputFile, pathExists } from 'fs-extra';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

/* process arguments */

program
  .usage('[@<organization>/<component-set>__<version>]')
  .name('bb components add')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();
})();
