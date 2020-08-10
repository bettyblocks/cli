import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { createServer as createHttpsServer, ServerOptions } from 'https';
import { existsSync } from 'fs';
import handler from 'serve-handler';
import * as fs from 'fs';
import { checkUpdateAvailableCLI } from './checkUpdateAvailable';
import { ServeOptions } from '../types';

const serveComponentSet = (options: ServeOptions): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const serverOptions: ServerOptions = {};
    const createServer = options.ssl ? createHttpsServer : createHttpServer;

    if (options.ssl) {
      if (!fs.existsSync(options.sslKey)) {
        throw new Error(`Private key '${options.sslKey}' does not exists.`);
      }

      if (!fs.existsSync(options.sslCert)) {
        throw new Error(`Certificate '${options.sslCert}' does not exists.`);
      }

      serverOptions.key = fs.readFileSync(options.sslKey);
      serverOptions.cert = fs.readFileSync(options.sslCert);
    }

    const listener = (
      response: IncomingMessage,
      request: ServerResponse,
    ): Promise<void> =>
      handler(response, request, {
        public: `${options.rootDir}/dist`,
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
      });

    createServer(serverOptions, listener)
      .on('error', error => reject(error.message))
      .listen(options.port, options.host, () => resolve());
  });
};

export default async (options: ServeOptions): Promise<void> => {
  await checkUpdateAvailableCLI();
  if (!existsSync(`${options.rootDir}/dist`)) {
    throw new Error(`Directory '${options.rootDir}/dist' does not exists.`);
  }

  return serveComponentSet(options);
};
