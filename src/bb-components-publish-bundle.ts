/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */

import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import {
  publish,
  validateBucketName,
} from './functions/bb-components-functions';

interface CommanderBucket extends CommanderStatic {
  bucket?: string;
}
program
  .usage('[options] [path]')
  .name('bb components publish-bundle')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);
const { args, bucket }: CommanderBucket = program;
const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;
if (!bucket) {
  throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
}
validateBucketName(bucket);
/* eslint-disable */
const readJS = async (fileName: string): Promise<string> => {
  try {
    return readFileSync(`${distDir}/${fileName}`, 'utf8');
  } catch (error) {
    const { code, message }: Error & { code: 'ENOENT' | string } = error;

    throw new Error(
      chalk.red(
        [
          'There was an error trying to publish your component set',
          code === 'ENOENT' ? message : error,
        ].join('\n'),
      ),
    );
  }
};
/* eslint-enable */

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  const files = ['bundle.js', 'bundle.js.map'];
  const [{ url }] = await Promise.all(
    files.map(async (fileName) => {
      const objects = await readJS(fileName);
      return publish(fileName, bucket, objects, 'text/javascript');
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
