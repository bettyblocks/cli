/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { CommandFunctions } from './types';

/* setup */

const availableCommands: CommandFunctions[] = ['init'];

/* process arguments */

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb functions')
  .command('init [identifier]', 'initialize custom functions project')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandFunctions)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
