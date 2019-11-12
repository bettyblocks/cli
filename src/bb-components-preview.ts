/* npm dependencies */

import program, { CommanderStatic } from 'commander';

import { exec } from 'child_process';

/* setup */

/* process arguments */

program
  .usage('[options] [path]')
  .name('bb components preview')
  // .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);

// const { args }: CommanderStatic = program;

/* execute command */

(async (): Promise<void> => {
  exec('ls', (err, stdout) => {
    if (err) {
      throw err;
    } else {
      console.log(stdout);
    }
  });
})();
