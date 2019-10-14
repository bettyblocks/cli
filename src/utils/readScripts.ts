import { promises } from 'fs-extra';

const { readdir } = promises;

export default async (dir: string): Promise<string[]> => {
  const files: string[] = await readdir(dir);

  return files.filter((file: string): boolean => file.endsWith('.js'));
};
