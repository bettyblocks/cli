#!/usr/bin/env node

/* npm dependencies */

import chalk from 'chalk';
import program from 'commander';

/* internal dependencies */
import { CommandBB } from './types';

/* setup */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version }: { version: string } = require('../package.json');

const availableCommands: CommandBB[] = [
  'login',
  'components',
  'bundle',
  'help',
];

/* process arguments */

program
  .description('The Betty Blocks CLI')
  .version(version)
  .command('login', 'login to your Betty Blocks account')
  .command('components <cmd>', 'manage your component sets')
  .command('bundle <cmd>', 'manage your vendor bundle')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBB)) {
      throw new Error(chalk.red(`\nInvalid command: ${command}\n`));
    }
  })
  .parse(process.argv);
