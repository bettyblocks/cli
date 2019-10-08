import program, { CommanderStatic } from 'commander';
import { resolve, sep } from 'path';

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

const dirName: string = resolve(rootDir)
  .split(sep)
  .slice(-1)[0];

serveComponentSet(rootDir, dirName, port);
