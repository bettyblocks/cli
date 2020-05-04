/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { CommandInteractions } from './types';

/* setup */

const availableCommands: CommandInteractions[] = ['generate'];

/* process arguments */

program
  .usage(`<${availableCommands.join('|')}>`)
  .command('generate [name]', 'generate an interaction with a given name')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandInteractions)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
