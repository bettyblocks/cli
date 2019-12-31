/* npm dependencies */

import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { get, IncomingMessage } from 'http';
import { join } from 'path';
import { x } from 'tar';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

/* types */

export interface Registry {
  data: RegistryEntry[];
}

export interface RegistryEntry {
  name: string;
  path: string;
  public: boolean;
  version: string;
}

/* process arguments */

program
  .usage('{@<organization}/{component-set}>')
  .name('bb components add')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const [set] = args;

const getSetHandler = (res: IncomingMessage): void => {
  const { statusCode } = res;

  if (statusCode === 404) {
    throw new ReferenceError('404: component set not found');
  }

  if (statusCode === 500) {
    throw new Error('500: something went wrong on our end :(');
  }

  if (statusCode !== 200) {
    throw new Error('Unknown error');
  }

  res.setEncoding('binary');

  const zip = x({
    cwd: join(__dirname, 'test'),
  });

  res.on('data', (chunk: string): void => {
    zip.write(Buffer.from(chunk, 'binary'));
  });

  res.on('error', (error: Error): void => {
    console.log('Something went wrong while retrieving the component set.');

    throw error;
  });

  res.on('end', () => {
    zip.end();
  });
};

const getSet = (path: string): void => {
  try {
    get(
      // TODO: fix host
      `http://localhost:3030/${path}`,
      getSetHandler,
    );
  } catch (error) {
    console.log('Something went wrong while requesting the component set.');
    console.error(error);
  }
};

const getVersionsHandler = (
  res: IncomingMessage,
  callback: (versions: Registry) => void,
): void => {
  const { statusCode } = res;

  if (statusCode === 404) {
    throw new ReferenceError('404: component set not found');
  }

  if (statusCode === 500) {
    throw new Error('500: something went wrong on our end :(');
  }

  if (statusCode !== 200) {
    throw new Error('Unknown error');
  }

  res.setEncoding('utf8');

  let chunks: string[] = [];

  res.on('data', (chunk: string): void => {
    chunks.push(chunk);
  });

  res.on('error', (error: Error): void => {
    console.log(
      'Something went wrong while retrieving component set versions.',
    );

    throw error;
  });

  res.on('end', () => {
    try {
      const registry = JSON.parse(chunks.join(''));

      callback(registry);
    } catch (error) {
      console.log('Something went wrong while parsing component set versions.');

      throw error;
    }
  });
};

const getVersions = (
  set: string,
  callback: (versions: Registry) => void,
): void => {
  try {
    get(
      `http://localhost:3030/api/blocks/${set}`,
      (res: IncomingMessage): void => getVersionsHandler(res, callback),
    );
  } catch (error) {
    console.error(
      chalk.red(
        `Something went wrong while requesting component set versions. ${error}`,
      ),
    );
  }
};

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  getVersions(set, ({ data: [{ path }] }: Registry): void => {
    getSet(path);
  });
})();
