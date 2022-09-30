import { statSync } from 'fs';
import { promises } from 'fs-extra';
import path from 'path';

const { readdir } = promises;

export default async (dir: string, extension = 'js'): any => {
  const files: string[] = await readdir(dir);

  let returnFiles: any = [];

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
