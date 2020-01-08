import chalk from 'chalk';
import { existsSync } from 'fs';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import handler from 'serve-handler';

import { checkUpdateAvailableCLI } from './checkUpdateAvailable';
import getRootDir from './getRootDir';

const serveComponentSet = (rootDir: string, port: number): void => {
  const server: Server = createServer(
    (response: IncomingMessage, request: ServerResponse): Promise<void> =>
      handler(response, request, {
        public: `${rootDir}/dist`,
        headers: [
          {
            source: '**/*.@(json)',
            headers: [
              {
                key: 'Access-Control-Allow-Origin',
                value: '*',
              },
              {
                key: 'Cache-Control',
                value: 'no-cache ',
              },
            ],
          },
        ],
      }),
  );

  server.listen(port, (): void => {
    console.info(
      chalk.green(`Serving the component set at http://localhost:${port}`),
    );
  });
};

export default async (port: number): Promise<void> => {
  try {
    const rootDir = await getRootDir();
    await checkUpdateAvailableCLI();
    if (existsSync(`${rootDir}/dist`)) {
      serveComponentSet(rootDir, port);
    } else {
      throw new Error(
        '\nAn error has occurred, please check if something went wrong during the build step.\n',
      );
    }
  } catch ({ name, message }) {
    console.error(chalk.red(`${name}: ${message}`));
  }
};
