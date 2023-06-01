/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */

import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { readFile } from 'fs';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import {
  publish,
  validateBucketName,
} from './functions/bb-components-functions';

interface CommanderBucket extends CommanderStatic {
  bucket?: { name: string };
}
program
  .usage('[options] [path]')
  .name('bb components publishbundle')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);
const { args, bucket }: CommanderBucket = program;
const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;
if (!bucket) {
  throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
}
validateBucketName(bucket.name);
/* eslint-disable */
const readJS = async (fileName: string): Promise<void> => {
  readFile(`${distDir}/${fileName}`, (err, data) => {
    if (data) {
      return data;
    }
    if (err) {
      throw new Error(
        chalk.red(
          [
            'There was an error trying to publish the bundle to the bucket',
            err.code === 'ENOENT' ? err.message : err,
          ].join('\n'),
        ),
      );
    }
  });
};
/* eslint-enable */

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  const files = ['bundle.js', 'bundle.js.map'];
  const [{ url }] = await Promise.all(
    files.map((fileName) => publish(fileName, bucket?.name, readJS)),
  );

  console.log(
    chalk.green(
      `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your newly updated bundle:\n
${url}`,
    ),
  );
})();
