/* npm dependencies */

import program, { CommanderStatic } from 'commander';

import { parsePort } from './utils/arguments';
import servePreview from './utils/servePreview';

/* process arguments */

program
  .usage('[path]')
  .name('bb components preview')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 3001.')
  .parse(process.argv);

const { port: portRaw }: CommanderStatic = program;
const port: number = parsePort(portRaw, 3001);

/* execute command */

servePreview(port);
