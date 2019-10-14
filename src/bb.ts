#!/usr/bin/env node

import program from 'commander';

const availableCommands = ['components', 'help'];

program
  .description('The Betty Blocks CLI')
  .version('1.0.0')
  .command('components <cmd>', 'manage your component sets')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command)) {
      console.error('Invalid command: %s\n', program.args.join(' '));
      program.outputHelp();
      process.exit(1);
    }
  })
  .parse(process.argv);
