/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { CommandBlocks } from './types';

/* setup */

const availableCommands: CommandBlocks[] = ['publish', 'new'];

/* process arguments */

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb blocks')
  .command('new [blocks-name]', 'Initialize a new block')
  .command('publish', 'publish blocks of current working directory')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBlocks)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
