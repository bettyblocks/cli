import { ensureDir } from 'fs-extra';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { x } from 'tar';

import got from './client';
import { RegistryEntry } from '../types';

export const install = async (
  registry: string,
  { name, version }: RegistryEntry,
  rootDir: string,
): Promise<void> => {
  try {
    const cwd = `${rootDir}/betty_blocks/${name}`;

    await ensureDir(cwd);
    await promisify(pipeline)(
      got.stream(`${registry}/blocks/${name}-${version}.tgz`),
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

export const exists = async (
  registry: string,
  { name, version }: RegistryEntry,
): Promise<RegistryEntry> => {
  await got.head(`${registry}/blocks/${name}-${version}.tgz`);

  return { name, version };
};
