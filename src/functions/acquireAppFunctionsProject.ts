import fs from 'fs';
import path from 'path';

const acquireAppFunctionsProject = (dir: string): string => {
  const expected = ['functions.json', 'package.json', '.app-functions'];
  const intersection = fs
    .readdirSync(dir)
    .filter(file => expected.includes(file));

  if (intersection.length === expected.length) {
    return path.basename(dir);
  }

  throw new Error(
    'The current directory is not an app functions project. Abort.',
  );
};

export default acquireAppFunctionsProject;
