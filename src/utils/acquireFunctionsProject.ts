import fs from 'fs';
import path from 'path';

// eslint-disable-next-line consistent-return
const acquireFunctionsProject = (dir: string): string => {
  const expected = ['functions.json', 'package.json', 'src'];
  const intersection = fs
    .readdirSync(dir)
    .filter(file => expected.includes(file));

  if (intersection.length === expected.length) {
    return path.basename(dir);
  }

  console.log(
    'The current directory is not a custom functions project. Abort.',
  );

  process.exit();
};

export default acquireFunctionsProject;
