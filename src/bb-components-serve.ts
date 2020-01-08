/* npm dependencies */

import program, { CommanderStatic } from 'commander';

import { parsePort } from './utils/arguments';
import serveComponentSet from './utils/serveComponentSet';

/* process arguments */

program
  .usage('[path]')
  .name('bb components serve')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 5001.')
  .parse(process.argv);

const { port: portRaw }: CommanderStatic = program;
const port: number = parsePort(portRaw, 5001);

/* execute command */

serveComponentSet(port);
