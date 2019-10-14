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
      console.error('Invalid command: %s\n', program.args.join(' '));
      program.outputHelp();
      process.exit(1);
    }
  })
  .parse(process.argv);
