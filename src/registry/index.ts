import { ensureDir } from 'fs-extra';
import got from 'got';
import { pipeline } from 'stream';
import { x } from 'tar';
import { promisify } from 'util';

import { RegistryEntry } from '../types';

const REGISTRY_URL = 'http://localhost:3030';

export const install = async (
  { name, version }: RegistryEntry,
  rootDir: string,
): Promise<void> => {
  try {
    const cwd = `${rootDir}/betty_blocks/${name}`;

    await ensureDir(cwd);
    await promisify(pipeline)(
      got.stream(`${REGISTRY_URL}/blocks/${name}-${version}.tgz`),
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

export const exists = async ({
  name,
  version,
}: RegistryEntry): Promise<RegistryEntry> => {
  await got.head(`${REGISTRY_URL}/blocks/${name}-${version}.tgz`, {
    responseType: 'json',
  });

  return { name, version };
};
