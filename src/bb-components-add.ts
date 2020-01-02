/* npm dependencies */

import chalk from 'chalk';
import got from 'got';
import program, { CommanderStatic } from 'commander';
import { join } from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
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

const getSet = async (path: string): Promise<void> => {
  try {
    await promisify(pipeline)(
      got.stream(`http://localhost:3030/${path}`),
      x({ cwd: join(__dirname, 'test') }),
    );
  } catch (error) {
    const statusCode = error?.response?.statusCode;

    if (statusCode === 404) {
      throw new ReferenceError('404: component set not found');
    }

    if (statusCode === 500) {
      throw new Error('500: something went wrong on our end :(');
    }

    throw error;
  }
};

const getVersions = async (set: string): Promise<Registry> => {
  try {
    const { statusCode, body } = await got(
      `http://localhost:3030/api/blocks/${set}`,
      {
        responseType: 'json',
      },
    );

    if (statusCode === 404) {
      throw new ReferenceError('404: component set not found');
    }

    if (statusCode === 500) {
      throw new Error('500: something went wrong on our end :(');
    }

    if (statusCode !== 200) {
      throw new Error('Unknown error');
    }

    return body;
  } catch (error) {
    console.error(
      chalk.red(
        `Something went wrong while requesting component set versions. ${error}`,
      ),
    );
    return error;
  }
};

(async (): Promise<void> => {
  await checkUpdateAvailableCLI();

  const {
    data: [{ path }],
  }: Registry = await getVersions(set);

  await getSet(path);
})();
