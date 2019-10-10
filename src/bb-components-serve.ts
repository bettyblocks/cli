import program, { CommanderStatic } from 'commander';
import { basename } from 'path';

import serveComponentSet from './utils/serveComponentSet';
import { parseDir, parsePort } from './utils/arguments';

program
  .usage('[path]')
  .name('bb components serve')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 5001.')
  .parse(process.argv);

const { args, port: portRaw }: CommanderStatic = program;
const rootDir: string = parseDir(args);
const port: number = parsePort(portRaw, 5001);
const dirName: string = basename(rootDir);

serveComponentSet(rootDir, dirName, port);
