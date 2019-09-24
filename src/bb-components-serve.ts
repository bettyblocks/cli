import program, { CommanderStatic } from 'commander';
import serveComponentSet from './utils/serveComponentSet';
import { resolve, sep } from 'path';

program
  .usage('[path]')
  .name('bb components serve')
  .option('-p, --port [port]', 'Serve on a custom port. Defaults to 5001.')
  .parse(process.argv);

const { args }: CommanderStatic = program;
const rootDir: string = args.length === 0 ? '.' : args[0];
let { port } = program;

port = isNaN(port) ? 5001 : parseInt(port, 10);

const dirName = resolve(rootDir)
  .split(sep)
  .slice(-1)[0];

serveComponentSet(rootDir, dirName, port);
