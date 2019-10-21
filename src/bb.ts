#!/usr/bin/env node

/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { CommandBB } from './types';

/* setup */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version }: { version: string } = require('../package.json');

const availableCommands: CommandBB[] = ['components', 'help'];

/* process arguments */

program
  .description('The Betty Blocks CLI')
  .version(version)
  .command('components <cmd>', 'manage your component sets')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBB)) {
      throw new Error(`Invalid command: ${command}`);
    }
  })
  .parse(process.argv);
