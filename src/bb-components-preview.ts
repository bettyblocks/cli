import program, { CommanderStatic } from 'commander';
import { createServer } from 'http';
import handler from 'serve-handler';
import serveComponentSet from './utils/serveComponentSet';
import { resolve, sep } from 'path';

program
  .usage('[path]')
  .name('bb components preview')
  .option(
    '-pp, --preview_port [port]',
    'Port of the preview server. Defaults to 3003.',
  )
  .option(
    '-pc, --component_set_port [port]',
    'Serve on a custom port. Defaults to 5001.',
  )
  .parse(process.argv);

const { args }: CommanderStatic = program;
const rootDir: string = args.length === 0 ? '.' : args[0];

let {
  preview_port: previewPort,
  component_set_port: componentSetPort,
} = program;

const dirName = resolve(rootDir)
  .split(sep)
  .slice(-1)[0];

componentSetPort = isNaN(componentSetPort)
  ? 5001
  : parseInt(componentSetPort, 10);

serveComponentSet(rootDir, dirName, componentSetPort);

previewPort = isNaN(previewPort) ? 3003 : parseInt(previewPort, 10);

const previewServer = createServer((response, request) =>
  handler(response, request, {
    public: './preview/build',
  }),
);

previewServer.listen(previewPort, () => {
  console.info(
    `Serving preview of "${dirName}" Component Set at http://localhost:${previewPort}`,
  );
});
