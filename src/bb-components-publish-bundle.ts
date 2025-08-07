import chalk from 'chalk';
import { Command } from 'commander';
import { readFileSync } from 'fs';

import {
  publish,
  validateBucketName,
} from './functions/bb-components-functions';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const program = new Command();

program
  .usage('[options] [path]')
  .name('bb components publish-bundle')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);
const { args } = program;
const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;
const { bucket } = program.opts();
if (!bucket) {
  throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
}
validateBucketName(bucket);

const readJS = async (fileName: string): Promise<string> => {
  try {
    return readFileSync(`${distDir}/${fileName}`, 'utf8');
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

    throw new Error('Unknown error occurred');
  }
};

void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  const files = ['bundle.js', 'bundle.js.map'];
  const [{ url }] = await Promise.all(
    files.map(async (fileName) => {
      const objects = await readJS(fileName);
      return publish({
        blobContentType: 'text/javascript',
        bucketName: bucket,
        fileName,
        objects,
      });
    }),
  );

  console.log(
    chalk.green(
      `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your newly updated bundle:\n
${url}`,
    ),
  );
})();
