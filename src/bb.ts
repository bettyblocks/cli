#!/usr/bin/env node

import program from 'commander';
import { CommandBB } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version }: { version: string } = require('../package.json');

const availableCommands: CommandBB[] = ['components', 'help'];

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
