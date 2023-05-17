/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */

import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { readFile } from 'fs';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import { publish } from './functions/bb-components-functions';

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

if (typeof AZURE_BLOB_ACCOUNT !== 'string') {
  throw new Error(chalk.red('\n$AZURE_BLOB_ACCOUNT is required\n'));
}

if (typeof AZURE_BLOB_ACCOUNT_KEY !== 'string') {
  throw new Error(chalk.red('\n$AZURE_BLOB_ACCOUNT_KEY is required\n'));
}

/* Process arguments */

program
  .usage('[options] [path]')
  .name('bb components publish bundle')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);

const { args, bucket: name }: CommanderStatic = program;
const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;

if (!name || typeof name !== 'string' || !name.length) {
  throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
}

/* Execute functions */
const read = async (fileName: string): Promise<void> => {
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

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  const files = ['bundle.js', 'bundle.js.map'];
  const [{ url }] = await Promise.all(
    files.map((fileName) => publish(fileName, name, read)),
  );

  console.log(
    chalk.green(
      `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your newly updated bundle:\n
${url}`,
    ),
  );
})();
