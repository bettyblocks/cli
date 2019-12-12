#!/usr/bin/env node

/* npm dependencies */

import program from 'commander';
import chalk from 'chalk';

/* internal dependencies */

import { CommandBB } from './types';

/* setup */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version }: { version: string } = require('../package.json');

const availableCommands: CommandBB[] = ['components', 'bundle', 'help'];

/* process arguments */

program
  .description('The Betty Blocks CLI')
  .version(version)
  .command('components <cmd>', 'manage your component sets')
  .command('bundle <cmd>', 'manage your vendor bundle')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBB)) {
      throw new Error(chalk.red(`Invalid command: ${command}`));
    }
  })
  .parse(process.argv);
