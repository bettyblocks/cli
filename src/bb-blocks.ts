/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { CommandBlocks } from './types';

/* setup */

const availableCommands: CommandBlocks[] = ['new'];

/* process arguments */

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb blocks')
  .command('new [blocks-name]', 'Initialize a new block')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBlocks)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
