/* npm dependencies */

import program from 'commander';
import chalk from 'chalk';

import { CommandBundle } from './types';

/* internal dependencies */

/* setup */

const availableCommands: CommandBundle[] = ['init'];

/* process arguments */

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb bundle')
  .command('init <path>', 'create a new vendor bundle')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBundle)) {
      console.error(chalk.red('\nInvalid command: %s\n'), command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
