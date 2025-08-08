import chalk from 'chalk';
import { Command } from 'commander';

import pkg from '../package.json';
import { type CommandBB } from './types';

const availableCommands: CommandBB[] = [
  'blocks',
  'components',
  'functions',
  'interactions',
  'bundle',
  'help',
];

const program = new Command();

program
  .description('Betty Blocks CLI')
  .version(pkg.version, '-v, --version')
  .command('components [cmd]', 'manage your component sets')
  .command('blocks [cmd]', 'manage your blocks')
  .command('functions [cmd]', 'manage your custom functions')
  .command('interactions [cmd]', 'manage your interactions')
  .command('bundle [cmd]', 'manage your vendor bundle')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandBB)) {
      throw new Error(chalk.red(`\nInvalid command: ${command}\n`));
    }
  })
  .parse(process.argv);
