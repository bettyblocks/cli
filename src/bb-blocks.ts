import { Command } from 'commander';

import type { CommandBlocks } from './types';

const availableCommands: CommandBlocks[] = ['publish', 'release', 'new'];

const program = new Command();

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb blocks')
  .command('new [blocks-name]', 'Initialize a new block')
  .command('publish', 'publish blocks of current working directory')
  .command('release', 'release dev blocks')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBlocks)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
