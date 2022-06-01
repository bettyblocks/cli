/* npm dependencies */

import program from 'commander';

/* internal dependencies */

import { runTest } from './functions/testRunner';

/* process arguments */

program
  .usage('[pattern/for/test-files]')
  .name('bb functions test')
  .parse(process.argv);

const {
  args: [pattern],
} = program;

/* execute command */

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await runTest(pattern, process.cwd());
})();
