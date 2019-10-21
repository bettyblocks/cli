/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import { createServer, Server } from 'http';
import handler from 'serve-handler';
import { basename } from 'path';

/* internal dependencies */

import serveComponentSet from './utils/serveComponentSet';
import { parseDir, parsePort } from './utils/arguments';

/* process arguments */

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

const rootDir: string = parseDir(args);
const dirName: string = basename(rootDir);
const componentSetPort: number = parsePort(componentSetPortRaw, 5001);
const previewPort: number = parsePort(previewPortRaw, 3003);

/* execute command */

serveComponentSet(rootDir, dirName, componentSetPort);

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
