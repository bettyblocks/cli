import { statSync } from 'fs';
import { promises } from 'fs-extra';
import path from 'path';

const { readdir } = promises;

const buildLast = async (dir: string, extension = 'js'): Promise<string[]> => {
  const files: string[] = await readdir(dir);

  const returnFiles: string[] = [];

  files?.forEach((file) => {
    const absolutePath = path.join(dir, file);
    const fileStats = statSync(absolutePath);
    const modifiedTime = fileStats.mtime.valueOf();
    const aBitEarlier = new Date().valueOf() - 5000;
    if (modifiedTime > aBitEarlier && file.endsWith(`.${extension}`)) {
      returnFiles.push(file);
    }
  });

  return returnFiles;
};

const buildAll = async (dir: string, extension = 'js'): Promise<string[]> => {
  console.log('ik zit in de de buildAll');

  const files: string[] = await readdir(dir);
  console.log('type', extension);

  return files.filter((file: string): boolean =>
    file.endsWith(`.${extension}`),
  );
};

export default async (dir: string, extension = 'js'): Promise<string[]> => {
  // return all ? buildAll(dir, extension) : buildLast(dir, extension);
  // return buildAll(dir, extension);
  return buildLast(dir, extension);
};
