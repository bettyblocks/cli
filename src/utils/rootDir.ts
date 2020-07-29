import path from 'path';

const rootDir = (): string =>
  path.join((process.mainModule as NodeModule).filename, '..', '..');

export default rootDir;
