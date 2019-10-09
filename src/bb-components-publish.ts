import program from 'commander';
import { readJSON } from 'fs-extra';

import uploadBlob, {
  BlockBlobUploadResponseExtended,
} from './utils/uploadBlob';

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

program
  .usage('[options] <path>')
  .name('bb components publish')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);

const { args, bucket: name } = program;

const distDir: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;

if (!AZURE_BLOB_ACCOUNT) {
  throw Error('$AZURE_BLOB_ACCOUNT is required');
}

if (!AZURE_BLOB_ACCOUNT_KEY) {
  throw Error('$AZURE_BLOB_ACCOUNT_KEY is required');
}

if (!name || !name.length) {
  throw Error('-b or --bucket [name] is required');
}

const read: (fileName: string) => Promise<unknown> = (
  fileName: string,
): Promise<unknown> => {
  try {
    return readJSON(`${distDir}/${fileName}`);
  } catch (error) {
    console.error('There was an error trying to publish your component set');

    const { code, message } = error;

    throw Error(code === 'ENOENT' ? message : error);
  }
};

const publish: (
  fileName: string,
) => Promise<BlockBlobUploadResponseExtended> = async (
  fileName: string,
): Promise<BlockBlobUploadResponseExtended> => {
  const objects = await read(fileName);

  try {
    return uploadBlob(name, fileName, JSON.stringify(objects));
  } catch (error) {
    console.error('There was an error trying to publish your component set');

    const { body, message } = error;

    if (!body) {
      throw Error(message);
    }

    const { code, message: bodyMessage } = body;

    throw Error(
      `Code: ${code}\nMessage: ${
        code === 'AuthenticationFailed'
          ? 'Make sure your azure blob account and key are correct'
          : bodyMessage
      }`,
    );
  }
};

(async (): Promise<void> => {
  const [{ url }] = await Promise.all(
    ['partials.json', 'prefabs.json', 'templates.json'].map(publish),
  );

  console.log(
    `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your component set:\n
${url}`,
  );
})();
