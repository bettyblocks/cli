import program, { CommanderStatic } from 'commander';
import { resolve, sep } from 'path';

import serveComponentSet from './utils/serveComponentSet';

program
  .usage('[path]')
  .name('bb components serve')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 5001.')
  .parse(process.argv);

const { args, port: portRaw }: CommanderStatic = program;
const rootDir: string = args.length === 0 ? '.' : args[0];
const port: number = Number.isNaN(portRaw) ? 5001 : parseInt(portRaw, 10);

const dirName: string = resolve(rootDir)
  .split(sep)
  .slice(-1)[0];

serveComponentSet(rootDir, dirName, port);
