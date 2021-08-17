import program from 'commander';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';

/* process arguments */
program.name('bb functions logout').parse(process.argv);

const confCassie = path.join(os.homedir(), '.bb-cli');
const confFA = path.join(os.homedir(), '.bb-cli-fa');

try {
  if (fs.existsSync(confCassie)) {
    fs.removeSync(confCassie);
  }

  if (fs.existsSync(confFA)) {
    fs.removeSync(confFA);
  }

  console.log('You are now logged out!');
} catch (err) {
  console.log(`Could not log you out. Please contact support. Error: ${err}`);
}
