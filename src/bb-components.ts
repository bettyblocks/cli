import program from 'commander';

const availableCommands = [
  'create',
  'build',
  'serve',
  'publish',
  'preview',
  'help',
];

program
  .usage('<create|build|serve|preview|publish>')
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
    'publish <--bucket> [path]',
    'publish the component set from a specific path, defaults to CWD',
  )
  .on('command:*', command => {
    if (!availableCommands.includes(command[0])) {
      console.error('Invalid command: %s\n', program.args.join(' '));
      program.outputHelp();
      process.exit(1);
    }
  })
  .parse(process.argv);
