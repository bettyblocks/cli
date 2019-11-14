import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import handler from 'serve-handler';
import path from 'path';

export default (port: number): void => {
  const server: Server = createServer(
    (response: IncomingMessage, request: ServerResponse): Promise<void> =>
      handler(response, request, {
        public: path.join(
          __dirname,
          '../../node_modules/@betty-blocks/preview/build',
        ),
      }),
  );

  server.listen(port, (): void => {
    console.info(`Serving the preview at http://localhost:${port}`);
  });
};
