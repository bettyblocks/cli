/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions */
/* npm dependencies */

import { spawn } from 'child_process';
import program from 'commander';

/* process arguments */
program
  .usage('[path]')
  .name('bb components test')
  .option('--path [path]', 'Path to testfile.', '')
  .parse(process.argv);

const options = {
  path: program.path as string,
};
/* execute command */
console.log('starting test...');

new Promise((resolve): void => {
  let build = spawn(`npm run test`, {
    shell: true,
  });

  if (options.path) {
    build = spawn(`npm run test ${options.path}`, {
      shell: true,
    });
  }

  build.stdout.pipe(process.stdout);
  build.stderr.pipe(process.stderr);
  build.on('close', resolve);
})
  .then(() => {
    console.log('Test complete.');
  })
  .catch((err: NodeJS.ErrnoException) => {
    console.log(`${err}\nAbort.`);
    process.exit();
  });
