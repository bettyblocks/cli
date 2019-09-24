import program from 'commander';
import { readJsonSync } from 'fs-extra';
import uploadBlob from './utils/uploadBlob';
import { logIOError, logUploadError } from './utils/logErrors';

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

program
  .usage('[options] <path>')
  .name('bb components publish')
  .option('-b, --bucket [name]', 'the component set name')
  .parse(process.argv);

const { args } = program;

const path: string = args.length === 0 ? 'dist' : `${args[0]}/dist`;

if (!AZURE_BLOB_ACCOUNT) {
  console.error('$AZURE_BLOB_ACCOUNT is required');
  process.exit(1);
}

if (!AZURE_BLOB_ACCOUNT_KEY) {
  console.error('$AZURE_BLOB_ACCOUNT_KEY is required');
  process.exit(1);
}

const name = program.bucket;

if (!name || !name.length) {
  console.error('-b or --bucket [name] is required');
  process.exit(1);
}

try {
  const templates = readJsonSync(`${path}/templates.json`);
  const prefabs = readJsonSync(`${path}/prefabs.json`);
  const partials = readJsonSync(`${path}/partials.json`);

  Promise.all([
    uploadBlob(name, 'templates.json', JSON.stringify(templates)),
    uploadBlob(name, 'prefabs.json', JSON.stringify(prefabs)),
    uploadBlob(name, 'partials.json', JSON.stringify(partials)),
  ])
    .then(([{ url }]) =>
      console.log(
        `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your component set:\n
${url}`,
      ),
    )
    .catch(error => {
      logUploadError(error);
      process.exit(1);
    });
} catch (error) {
  logIOError(error);
  process.exit(1);
}
