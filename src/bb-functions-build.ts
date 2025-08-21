/* npm dependencies */

import { spawn } from 'child_process';
import { Command } from 'commander';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

import acquireCustomFunctionsProject from './functions/acquireCustomFunctionsProject';
import rootDir from './utils/rootDir';

const program = new Command();

program.name('bb functions build').parse(process.argv);

/* execute command */

const workingDir = process.cwd();
const identifier = acquireCustomFunctionsProject(workingDir);

console.log(
  `Building ${identifier}.bettyblocks.com bundle (this can take a while) ...`,
);

new Promise((resolve): void => {
  const packerDir = path.join(rootDir(), 'assets', 'functions', 'packer');
  const buildDir = path.join(os.tmpdir(), identifier);
  const sourceSrc = path.join(workingDir, 'src');
  const targetSrc = path.join(buildDir, 'src');
  const sourcePackage = path.join(workingDir, 'package.json');
  const targetPackage = path.join(buildDir, 'package.json');
  const sourceConfig = path.join(workingDir, 'webpack.config.js');
  const targetConfig = path.join(buildDir, 'webpack.config.js');

  if (!fs.pathExistsSync(sourceConfig)) {
    fs.copySync(path.join(packerDir, 'webpack.config.js'), sourceConfig);
  }

  fs.emptyDir(buildDir, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.log(`${err.message}. Abort.`);
    }

    fs.copySync(packerDir, buildDir);
    fs.copySync(sourceSrc, targetSrc);
    fs.copySync(sourceConfig, targetConfig);

    const sourceJson = fs.readJsonSync(sourcePackage);
    const targetJson = fs.readJsonSync(targetPackage);

    targetJson.dependencies = {
      ...targetJson.dependencies,
      ...sourceJson.dependencies,
    };

    fs.writeFileSync(targetPackage, JSON.stringify(targetJson, null, 2));

    const build = spawn(`cd ${buildDir} && npm install && npm run build`, {
      shell: true,
    });

    build.stdout.pipe(process.stdout);
    build.stderr.pipe(process.stderr);
    build.on('close', resolve);
  });
})
  .then(() => {
    console.log('Done.');
  })
  .catch((err: NodeJS.ErrnoException) => {
    console.log(`${err}\nAbort.`);
    process.exit();
  });
