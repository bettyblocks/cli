import chalk from 'chalk';
import { Command } from 'commander';
import { pathExists, readJSON } from 'fs-extra';

import { publish } from './functions/bb-components-functions';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const program = new Command();

program
  .usage('[options] [path]')
  .name('bb components publish')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);

const { args } = program;
const name = program.opts().bucket;
const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;

if (!name || typeof name !== 'string' || !name.length) {
  throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
}

const read = async (fileName: string): Promise<void> => {
  try {
    return await readJSON(`${distDir}/${fileName}`);
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      throw new Error(
        chalk.red(
          [
            'There was an error trying to publish your component set',
            message,
          ].join('\n'),
        ),
      );
    }

    throw new Error(`Unknown error occurred: ${error}`);
  }
};

void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  const files = ['prefabs.json', 'templates.json', 'interactions.json'];
  const existingPath = await pathExists(`${distDir}/pagePrefabs.json`);
  const existingPartialPath = await pathExists(`${distDir}/partials.json`);

  if (existingPath) {
    files.push('pagePrefabs.json');
  }
  if (existingPartialPath) {
    files.push('partials.json');
  }
  const [{ url }] = await Promise.all(
    files.map(async (fileName) => {
      const objects = await read(fileName);
      return publish({
        blobContentType: 'text/html',
        bucketName: name,
        fileName,
        objects: JSON.stringify(objects),
      });
    }),
  );

  console.log(
    chalk.green(
      `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your component set:\n
${url}`,
    ),
  );
})();
