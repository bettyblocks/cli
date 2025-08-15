import { existsSync, readFileSync } from 'fs';
import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse,
} from 'http';
import { createServer as createHttpsServer, type ServerOptions } from 'https';
import handler from 'serve-handler';

import type { ServeOptions } from '../types';
import { checkUpdateAvailableCLI } from './checkUpdateAvailable';

const serveComponentSet = (options: ServeOptions): Promise<void> =>
  new Promise<void>((resolve, reject): void => {
    const serverOptions: ServerOptions = {};
    const createServer = options.ssl ? createHttpsServer : createHttpServer;

    if (options.ssl) {
      if (!existsSync(options.sslKey)) {
        throw new Error(`Private key '${options.sslKey}' does not exists.`);
      }

      if (!existsSync(options.sslCert)) {
        throw new Error(`Certificate '${options.sslCert}' does not exists.`);
      }

      serverOptions.key = readFileSync(options.sslKey);
      serverOptions.cert = readFileSync(options.sslCert);
    }

    const listener = (
      response: IncomingMessage,
      request: ServerResponse,
    ): Promise<void> =>
      handler(response, request, {
        headers: [
          {
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
            source: '**/*.@(json)',
          },
        ],
        public: `${options.rootDir}/dist`,
      });

    createServer(serverOptions, listener)
      .on('error', (error) => reject(new Error(error)))
      .listen(options.port, options.host, () => resolve());
  });

export default async (
  options: ServeOptions,
  hasOfflineFlag: boolean,
): Promise<void> => {
  if (!hasOfflineFlag) {
    await checkUpdateAvailableCLI();
  }
  if (!existsSync(`${options.rootDir}/dist`)) {
    throw new Error(`Directory '${options.rootDir}/dist' does not exists.`);
  }

  return serveComponentSet(options);
};
