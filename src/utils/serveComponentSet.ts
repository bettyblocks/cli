import { createServer } from 'http';
import handler from 'serve-handler';

export default (rootDir: string, dirName: string, port: number): void => {
  const server = createServer((response, request) =>
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
          ],
        },
      ],
    }),
  );

  server.listen(port, () => {
    console.info(
      `Serving "${dirName}" Component Set at http://localhost:${port}`,
    );
  });
};
