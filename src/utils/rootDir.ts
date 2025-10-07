import path from 'path';

const rootDir = (): string => path.join(Bun.main, '..', '..');

export default rootDir;
