/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { readJSON, pathExists } from 'fs-extra';

import uploadBlob, {
  BlockBlobUploadResponseExtended,
} from './utils/uploadBlob';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

/* setup */

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

if (typeof AZURE_BLOB_ACCOUNT !== 'string') {
  throw new Error(chalk.red('\n$AZURE_BLOB_ACCOUNT is required\n'));
}

if (typeof AZURE_BLOB_ACCOUNT_KEY !== 'string') {
  throw new Error(chalk.red('\n$AZURE_BLOB_ACCOUNT_KEY is required\n'));
}

/* process arguments */

program
  .usage('[options] [path]')
  .name('bb components publish')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);

const { args, bucket: name }: CommanderStatic = program;
const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;

if (!name || typeof name !== 'string' || !name.length) {
  throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
}

/* execute command */

const read = async (fileName: string): Promise<void> => {
  try {
    return await readJSON(`${distDir}/${fileName}`);
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

const upload = async (
  objects: unknown,
  fileName: string,
): Promise<BlockBlobUploadResponseExtended> => {
  try {
    return await uploadBlob(name, fileName, JSON.stringify(objects));
  } catch (error) {
    const defaultMessage =
      'There was an error trying to publish your component set';
    const { body, message } = error;

    if (!body) {
      throw new Error(chalk.red([defaultMessage, message].join('\n')));
    }

    const { code, message: bodyMessage } = body;

    const extraMessage =
      code === 'AuthenticationFailed'
        ? 'Make sure your azure blob account and key are correct'
        : bodyMessage;

    throw new Error(chalk.red([defaultMessage, extraMessage].join('\n')));
  }
};

const publish = async (
  fileName: string,
): Promise<BlockBlobUploadResponseExtended> => {
  console.log(`Publishing ${fileName}.`);

  const objects = await read(fileName);

  return upload(objects, fileName);
};

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  const files = ['prefabs.json', 'templates.json', 'interactions.json'];
  const existingPath = await pathExists(`${distDir}/pagePrefabs.json`);

  if (existingPath) {
    files.push('pagePrefabs.json');
  }
  const [{ url }] = await Promise.all(files.map(publish));

  console.log(
    chalk.green(
      `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your component set:\n
${url}`,
    ),
  );
})();
