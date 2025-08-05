import { statSync } from 'fs';
import { readdir } from 'fs-extra';
import path from 'path';

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
  const files: string[] = await readdir(dir);

  return files.filter((file: string): boolean =>
    file.endsWith(`.${extension}`),
  );
};

export default async (
  dir: string,
  extension = 'js',
  buildAllFiles = true,
): Promise<string[]> => {
  return buildAllFiles ? buildAll(dir, extension) : buildLast(dir, extension);
};
