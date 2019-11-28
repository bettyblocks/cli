import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import handler from 'serve-handler';
import path from 'path';
import fs from 'fs';

export default async (port: number): Promise<void> => {
  const nodeModulesDir = (process.mainModule as { paths: string[] }).paths[1];
  const yarnInstallDir: string = path.join(
    nodeModulesDir,
    '../../preview/build',
  );
  const npmInstallDir: string = path.join(
    nodeModulesDir,
    './@betty-blocks/preview/build',
  );
  try {
    const dirCheckNpm: void = await fs.promises.access(
      npmInstallDir,
      fs.constants.F_OK,
    );

    const location: string =
      dirCheckNpm !== undefined ? yarnInstallDir : npmInstallDir;

    const server: Server = createServer(
      (response: IncomingMessage, request: ServerResponse): Promise<void> =>
        handler(response, request, {
          public: location,
        }),
    );

    server.listen(port, (): void => {
      console.info(`Serving the preview at http://localhost:${port}`);
    });
  } catch {
    console.error(
      'Cannot find the preview directory, please try again after upgrading the CLI to the latest version.',
    );
  }
};
