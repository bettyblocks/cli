import program from 'commander';
import { CommandComponents } from './types';

const availableCommands: CommandComponents[] = [
  'create',
  'build',
  'serve',
  'publish',
  'preview',
  'help',
];

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
    'preview [path]',
    'serve the component set at a specific path, defaults to CWD',
  )
  .command(
    'publish [options] [path]',
    'publish the component set from a specific path, defaults to CWD',
  )
  .on('command:*', ([command]: string[]): void => {
    if (!availableCommands.includes(command as CommandComponents)) {
      console.error('Invalid command: %s\n', command);
      program.outputHelp();
    }
  })
  .parse(process.argv);
