/* npm dependencies */

import program, { CommanderStatic } from 'commander';

import { parseDir, parsePort } from './utils/arguments';
import serveComponentSet from './utils/serveComponentSet';

/* internal dependencies */

/* process arguments */

program
  .usage('[path]')
  .name('bb components serve')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 5001.')
  .parse(process.argv);

const { args, port: portRaw }: CommanderStatic = program;
const rootDir: string = parseDir(args);
const port: number = parsePort(portRaw, 5001);

/* execute command */

serveComponentSet(rootDir, port);
