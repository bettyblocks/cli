/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
/* npm dependencies */

import fs from 'fs-extra';
import path from 'path';
import program from 'commander';

/* internal dependencies */

import publishAppFunctions from './functions/publishAppFunctions';
import publishCustomFunctions from './functions/publishCustomFunctions';

/* process arguments */

program
  .name('bb functions publish')
  .option('-b, --bump', 'Bump the revision number.')
  .option('-s, --skip', 'Skip building the custom functions bundle.')
  .option(
    '-h, --host <host>',
    'Set hostname to publish to. Defaults to <identifier>.bettyblocks.com',
  )
  .parse(process.argv);

const bumpRevision = program.bump;
const skipBuild = program.skip;
const { host } = program;

/* execute command */

const workingDir = process.cwd();

if (fs.existsSync(path.join(workingDir, 'config.json'))) {
  publishAppFunctions();
} else {
  publishCustomFunctions(host, bumpRevision, skipBuild);
}
