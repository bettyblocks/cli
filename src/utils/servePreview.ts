import chalk from 'chalk';
import { existsSync } from 'fs';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { join } from 'path';
import handler from 'serve-handler';

import { checkUpdateAvailablePreview } from './checkUpdateAvailable';

const NODE_MODULES = (process.mainModule as { paths: string[] }).paths[1];

const relativePath = (path: string): string => join(NODE_MODULES, path);

const BUILD_PATH_NPM = relativePath('./@betty-blocks/preview/build');
const BUILD_PATH_YARN = relativePath('../../preview/build');

const startServer = async (path: string, port: number): Promise<void> => {
  await checkUpdateAvailablePreview(path);

  const server = createServer(
    (response: IncomingMessage, request: ServerResponse): Promise<void> =>
      handler(response, request, { public: path }),
  );

  server.listen(port, (): void => {
    console.info(
      chalk.green(`Serving the preview at http://localhost:${port}`),
    );
  });
};

export default (port: number): void => {
  if (existsSync(BUILD_PATH_NPM)) {
    startServer(BUILD_PATH_NPM, port);
  } else if (existsSync(BUILD_PATH_YARN)) {
    startServer(BUILD_PATH_YARN, port);
  } else {
    console.error(
      chalk.red(
        '\nCannot find the preview directory, please try again after upgrading the CLI to the latest version.\n',
      ),
    );
  }
};
