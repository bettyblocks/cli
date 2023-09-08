/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { CommandFunctions } from './types';

/* setup */

const availableCommands: CommandFunctions[] = [
  'init',
  'login',
  'logout',
  'new',
  'build',
  'publish',
  'validate',
  'bump',
  'test',
];

/* process arguments */

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb functions')
  .command('build', 'build functions bundle file of current working directory')
  .command('bump', 'increase the major/minor version of a specific function')
  .command('init [identifier]', 'initialize functions project')
  .command('login', 'login using the same credentials as the IDE')
  .command('logout', 'remove all tokens used to authenticate with the APIs')
  .command('new [function-name]', 'Initialize a new function')
  .command('publish', 'publish functions of current working directory')
  .command('validate', 'validate functions of current working directory')
  .command(
    'test',
    'test your functions within a local light-weight version of the ActionJS environment',
  )
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandFunctions)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
