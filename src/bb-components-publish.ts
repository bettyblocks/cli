/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import { readJSON } from 'fs-extra';

import uploadBlob, {
  BlockBlobUploadResponseExtended,
} from './utils/uploadBlob';

/* setup */

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

if (typeof AZURE_BLOB_ACCOUNT !== 'string') {
  throw new Error('$AZURE_BLOB_ACCOUNT is required');
}

if (typeof AZURE_BLOB_ACCOUNT_KEY !== 'string') {
  throw new Error('$AZURE_BLOB_ACCOUNT_KEY is required');
}

/* process arguments */

program
  .usage('[options] [path]')
  .name('bb components publish')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);

const { args, bucket: name }: CommanderStatic = program;
const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;

if (!name || !name.length) {
  throw new Error('-b or --bucket [name] is required');
}

/* execute command */

const read = async (fileName: string): Promise<void> => {
  try {
    return readJSON(`${distDir}/${fileName}`);
  } catch (error) {
    const { code, message }: Error & { code: 'ENOENT' | string } = error;

    throw new Error(
      [
        'There was an error trying to publish your component set',
        code === 'ENOENT' ? message : error,
      ].join('\n'),
    );
  }
};

const upload = async (
  objects: unknown,
  fileName: string,
): Promise<BlockBlobUploadResponseExtended> => {
  try {
    return uploadBlob(name, fileName, JSON.stringify(objects));
  } catch (error) {
    const defaultMessage =
      'There was an error trying to publish your component set';
    const { body, message } = error;

    if (!body) {
      throw new Error([defaultMessage, message].join('\n'));
    }

    const { code, message: bodyMessage } = body;

    const extraMessage =
      code === 'AuthenticationFailed'
        ? 'Make sure your azure blob account and key are correct'
        : bodyMessage;

    throw new Error([defaultMessage, extraMessage].join('\n'));
  }
};

const publish = async (
  fileName: string,
): Promise<BlockBlobUploadResponseExtended> => {
  console.log(`Publishing ${fileName}.`);

  const objects = await read(fileName);

  return upload(objects, fileName);
};

(async (): Promise<void> => {
  const [{ url }] = await Promise.all(
    ['prefabs.json', 'templates.json'].map(publish),
  );

  console.log(
    `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your component set:\n
${url}`,
  );
})();
