/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
/* npm dependencies */

import program, { CommanderStatic } from 'commander';
import chalk from 'chalk';
import { readJSON, pathExists } from 'fs-extra';
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';
import { publish } from './functions/bb-components-functions';

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

// eslint-disable-next-line no-void
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
    files.map((fileName) => publish(fileName, name, read)),
  );

  console.log(
    chalk.green(
      `Upload succesfully.\n
Use the following URL in the Page Builder to start working with your component set:\n
${url}`,
    ),
  );
})();
