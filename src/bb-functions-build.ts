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
  const packerDir = path.join(rootDir(), 'src', 'functions', 'packer'),
    buildDir = path.join(os.tmpdir(), identifier),
    sourceSrc = path.join(workingDir, 'src'),
    targetSrc = path.join(buildDir, 'src'),
    sourcePackage = path.join(workingDir, 'package.json'),
    targetPackage = path.join(buildDir, 'package.json'),
    sourceModules = path.join(workingDir, 'node_modules'),
    targetModules = path.join(buildDir, 'node_modules');

  fs.emptyDir(buildDir, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.log(`${err.message}. Abort.`);
    }

    fs.copySync(packerDir, buildDir);
    fs.copySync(sourceSrc, targetSrc);
    fs.copySync(sourceSrc, targetSrc);

    const sourceJson = fs.readJsonSync(sourcePackage),
      targetJson = fs.readJsonSync(targetPackage);

    targetJson['dependencies'] = {
      ...targetJson['dependencies'],
      ...sourceJson['dependencies'],
    };

    fs.writeJsonSync(targetPackage, targetJson);
    console.log('Building custom functions bundle file ...');

    const build = spawn(`cd ${buildDir} && npm install && npm run build`, {
      shell: true,
    });
    build.on('close', (code: number) => {
      console.log('Done.');
    });
  });
});
