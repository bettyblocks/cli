/* npm dependencies */

import path from 'path';
import program from 'commander';

/* internal dependencies */

import { convert } from './functions/icons';

/* process arguments */
program.name('bb functions converticons').parse(process.argv);

/* execute command */

// eslint-disable-next-line no-void
void ((): void => {
  const functionsPath = path.join(process.cwd(), 'functions');
  convert(functionsPath);
})();
