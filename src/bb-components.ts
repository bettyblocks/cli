/* npm dependencies */

import program from 'commander';

import { CommandComponents } from './types';

/* setup */

const availableCommands: CommandComponents[] = [
  'add',
  'build',
  'create',
  'generate',
  'help',
  'preview',
  'publish',
  'serve',
];

/* process arguments */

program
  .usage(`<${availableCommands.join('|')}>`)
  .name('bb components')
  .command('create <path>', 'create a new component set at path')
  .command(
    'build [path]',
    'build the component set at a specific path, defaults to CWD',
  )
  .command(
    'serve [path]',
    'serve the component set at a specific path, defaults to CWD',
  )
  .command(
    'preview [options]',
    'preview the component set at a specific path, defaults to CWD',
  )
  .command(
    'publish [options] [path]',
    'publish the component set from a specific path, defaults to CWD',
  )
  .command('generate [name]', 'generate a component with a given name')
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandComponents)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
