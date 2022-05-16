/* npm dependencies */

import path from 'path';
import program from 'commander';

/* internal dependencies */

import { migrate } from './functions/versions';

/* process arguments */
program.name('bb functions autoversion').parse(process.argv);

/* execute command */

// eslint-disable-next-line no-void
void ((): void => {
  const functionsPath = path.join(process.cwd(), 'functions');
  migrate(functionsPath, true);
})();
