/* npm dependencies */

import YAML from 'yaml';
import chalk from 'chalk';
import findUp from 'find-up';
import got from 'got';
import program, { CommanderStatic } from 'commander';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { ensureDir, readFile, writeFile } from 'fs-extra';
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

const REGISTRY_URL = 'http://localhost:3030';

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

const getRootDir = async (): Promise<string> => {
  const yaml = await findUp('bettyblocks.yaml');

  if (typeof yaml === 'string') {
    return yaml.split('/bettyblocks.yaml')[0];
  }

  throw new Error('Unable to resolve root dir');
};

const getSet = async (
  { name, path }: RegistryEntry,
  rootDir: string,
): Promise<void> => {
  try {
    const cwd = `${rootDir}/betty_blocks/${name}`;

    await ensureDir(cwd);
    await promisify(pipeline)(
      got.stream(`${REGISTRY_URL}/${path}`),
      x({ cwd }),
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

const getVersions = async (setName: string): Promise<Registry> => {
  try {
    const { body } = await got(`${REGISTRY_URL}/api/blocks/${setName}`, {
      responseType: 'json',
    });

    return body;
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

(async (): Promise<void> => {
  try {
    await checkUpdateAvailableCLI();

    const {
      data: [entry],
    } = await getVersions(set);

    const rootDir = await getRootDir();

    await getSet(entry, rootDir);

    const contents = await readFile(`${rootDir}/bettyblocks.yaml`);
    const yaml = YAML.parse(contents.toString());

    yaml.dependencies[set] = entry.version;

    await writeFile(`${rootDir}/bettyblocks.yaml`, YAML.stringify(yaml));
  } catch ({ message }) {
    console.log(chalk.red(message));
    process.exit(1);
  }
})();
