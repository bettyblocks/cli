/* npm dependencies */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import program from 'commander';

/* internal dependencies */

import rootDir from './utils/rootDir';
import withinFunctionsProject from './utils/withinFunctionsProject';

/* process arguments */

program.name('bb functions build').parse(process.argv);

/* execute command */

const workingDir = process.cwd();

withinFunctionsProject(workingDir, (identifier: string) => {
  const packerDir = path.join(rootDir(), 'assets', 'functions', 'packer');
  const buildDir = path.join(os.tmpdir(), identifier);
  const sourceSrc = path.join(workingDir, 'src');
  const targetSrc = path.join(buildDir, 'src');
  const sourcePackage = path.join(workingDir, 'package.json');
  const targetPackage = path.join(buildDir, 'package.json');

  fs.emptyDir(buildDir, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.log(`${err.message}. Abort.`);
    }

    fs.copySync(packerDir, buildDir);
    fs.copySync(sourceSrc, targetSrc);
    fs.copySync(sourceSrc, targetSrc);

    const sourceJson = fs.readJsonSync(sourcePackage);
    const targetJson = fs.readJsonSync(targetPackage);

    targetJson.dependencies = {
      ...targetJson.dependencies,
      ...sourceJson.dependencies,
    };

    fs.writeFileSync(targetPackage, JSON.stringify(targetJson, null, 2));
    console.log(`Building "${identifier}" custom functions bundle ...`);

    const build = spawn(`cd ${buildDir} && npm install && npm run build`, {
      shell: true,
    });
    build.on('close', () => {
      console.log('Done.');
    });
  });
});
