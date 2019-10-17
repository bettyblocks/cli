#!/usr/bin/env node

import program from 'commander';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

const availableCommands = ['components', 'help'];

program
  .description('The Betty Blocks CLI')
  .version(version)
  .command('components <cmd>', 'manage your component sets')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command)) {
      throw new Error(`Invalid command: ${program.args.join(' ')}\n`);
    }
  })
  .parse(process.argv);
