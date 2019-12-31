/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { get, IncomingMessage } from 'http';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

/* process arguments */

program
  .usage('[@<organization>/<component-set>__<version>]')
  .name('bb components add')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const [set] = args;

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  try {
    get(
      // TODO: fix host
      { host: 'blobbarinho.com', path: `${set}.tgz` },
      (res: IncomingMessage): void => {
        // TODO: handle timeout
        // TODO: handle 500
        // TODO: handle 404
        // TODO: store file
        // TODO: report success
        // TODO: handle failure to store file
      },
    );
  } catch (e) {
    // TODO: handle request error
  }
})();
