import { join } from 'path';

type FileMap = Record<string, { dest: string; src: string }>;

const CWD = process.cwd();

const DOT_FILE_NAMES = [
  '.eslintignore',
  '.eslintrc.json',
  '.gitignore',
  '.prettierignore',
  '.prettierrc.json',
];

const REGULAR_FILE_NAMES = ['package.json', 'README.md'];

export const FILE_NAMES = [...REGULAR_FILE_NAMES, ...DOT_FILE_NAMES];

export default async (): Promise<FileMap> => {
  const ASSET_PATH = join(
    (process.mainModule as NodeModule & { path: string }).path,
    '../assets/component-set',
  );

  return {
    ...DOT_FILE_NAMES.reduce(
      (mapping: FileMap, name: string): FileMap => ({
        [name]: {
          dest: join(CWD, name),
          src: join(ASSET_PATH, `__${name}`),
        },
        ...mapping,
      }),
      {} as FileMap,
    ),

    ...REGULAR_FILE_NAMES.reduce(
      (mapping: FileMap, name: string): FileMap => ({
        [name]: { src: join(ASSET_PATH, name), dest: join(CWD, name) },
        ...mapping,
      }),
      {} as FileMap,
    ),
  };
};
