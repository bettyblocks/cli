import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { readFile } from 'fs';

import uploadBlob, {
  BlockBlobUploadResponseExtended,
} from './utils/uploadBlob';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

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
  // what is meant with "The component set name?"
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
    const { code, message }: Error & { code: 'ENOENT' | string } = err;
    throw new Error(
      chalk.red(
        [
          'There was an error trying to publish the bundle to the bucket',
          code === 'ENOENT' ? message : err,
        ].join('\n'),
      ),
    );
  });
};
const upload = async (
  objects: unknown,
  fileName: string,
): Promise<BlockBlobUploadResponseExtended> => {
  try {
    return await uploadBlob(name, fileName, JSON.stringify(objects));
  } catch (error) {
    const defaultMessage =
      'There was an error trying to publish the bundle to the bucket';
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

void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  const files = ['bundle.js', 'bundle.js.map'];
  const [{ url }] = await Promise.all(files.map(publish));

  console.log(
    chalk.green(
      `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your newly updated bundle:\n
${url}`,
    ),
  );
})();
