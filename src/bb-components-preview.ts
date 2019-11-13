/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import { parseDir, parsePort } from './utils/arguments';

import servePreview from './utils/servePreview';

/* process arguments */

program
  .usage('[path]')
  .name('bb components preview')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 3001.')
  .parse(process.argv);

const { args, port: portRaw }: CommanderStatic = program;
const rootDir: string = parseDir(args);
const port: number = parsePort(portRaw, 3001);

/* execute command */
servePreview(rootDir, port);
