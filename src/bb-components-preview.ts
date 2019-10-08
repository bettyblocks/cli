import program, { CommanderStatic } from 'commander';
import { createServer, Server } from 'http';
import handler from 'serve-handler';
import { resolve, sep } from 'path';

import serveComponentSet from './utils/serveComponentSet';

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

const {
  args,
  preview_port: previewPortRaw,
  component_set_port: componentSetPortRaw,
}: CommanderStatic = program;

const rootDir: string = args.length === 0 ? '.' : args[0];

const dirName: string = resolve(rootDir)
  .split(sep)
  .slice(-1)[0];

const componentSetPort: number = Number.isNaN(componentSetPortRaw)
  ? 5001
  : parseInt(componentSetPortRaw, 10);

serveComponentSet(rootDir, dirName, componentSetPort);

const previewPort: number = Number.isNaN(previewPortRaw)
  ? 3003
  : parseInt(previewPortRaw, 10);

const previewServer: Server = createServer(
  (response, request): Promise<void> =>
    handler(response, request, {
      public: './preview/build',
    }),
);

previewServer.listen(previewPort, (): void => {
  console.info(
    `Serving preview of "${dirName}" Component Set at http://localhost:${previewPort}`,
  );
});
