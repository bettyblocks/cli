import program, { CommanderStatic } from 'commander';
import { resolve, sep } from 'path';

import serveComponentSet from './utils/serveComponentSet';

program
  .usage('[path]')
  .name('bb components serve')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 5001.')
  .parse(process.argv);

const { args }: CommanderStatic = program;
const rootDir: string = args.length === 0 ? '.' : args[0];
const { port: portRaw } = program;
const port = Number.isNaN(portRaw) ? 5001 : parseInt(portRaw, 10);

const dirName = resolve(rootDir)
  .split(sep)
  .slice(-1)[0];

serveComponentSet(rootDir, dirName, port);
