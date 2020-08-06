import fs from 'fs';
import path from 'path';

const withinFunctionsProject = (
  dir: string,
  callback: (identifier: string) => void,
): void => {
  const expected = ['functions.json', 'package.json', 'src'];
  const intersection = fs
    .readdirSync(dir)
    .filter(file => expected.includes(file));

  if (intersection.length === expected.length) {
    const identifier = path.basename(dir);
    callback(identifier);
  } else {
    console.log(
      'The current directory is not a custom functions project. Abort.',
    );
  }
};

export default withinFunctionsProject;
