/* npm dependencies */

import { Command } from 'commander';
import chalk from 'chalk';

import type { CommandBundle } from './types';

const availableCommands: CommandBundle[] = ['init'];

const program = new Command();

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
