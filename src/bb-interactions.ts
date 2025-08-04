import { Command } from 'commander';

import type { CommandInteractions } from './types';

const availableCommands: CommandInteractions[] = ['generate'];

const program = new Command();

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
