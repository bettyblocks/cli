import { createServer, Server } from 'http';
import handler from 'serve-handler';

export default (
  rootDir: string,
  componentSetDir: string,
  port: number,
): void => {
  const server: Server = createServer(
    (response, request): Promise<void> =>
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
      `Serving "${componentSetDir}" Component Set at http://localhost:${port}`,
    );
  });
};
