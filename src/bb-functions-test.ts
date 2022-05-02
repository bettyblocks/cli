/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { runTest } from './functions/testRunner';

/* process arguments */

program
  .usage('[path/to/test-file]')
  .name('bb functions test')
  .parse(process.argv);

const {
  args: [testFile],
} = program;

/* execute command */

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await runTest(testFile, process.cwd());
})();
