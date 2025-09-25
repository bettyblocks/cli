import { Command } from 'commander';

import type { CommandFunctions } from './types';

const availableCommands: CommandFunctions[] = [
  'bump',
  'init',
  'login',
  'logout',
  'new',
  'publish',
  'validate',
];

const program = new Command();

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb functions')
  .command('bump', 'increase the major/minor version of a specific function')
  .command('init', 'initialize functions project')
  .command('login', 'login using the same credentials as the IDE')
  .command('logout', 'remove all tokens used to authenticate with the APIs')
  .command('new [function-name]', 'Initialize a new function')
  .command('publish', 'publish functions of current working directory')
  .command('validate', 'validate functions of current working directory')
  .on('command:*', ([command]: CommandFunctions[]): void => {
    if (!availableCommands.includes(command)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
