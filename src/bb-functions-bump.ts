import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import {
  collectBumpInput,
  replaceVersionInCargoTomlFile,
  replaceVersionInWitFile,
} from './functions/functionVersionBump';

const program = new Command();

program.name('bb functions bump');

const check = chalk.green(`✔`);
const cross = chalk.red(`✖`);

const workingDir = process.cwd();

const isWasmFunctionProject = fs.existsSync(
  path.join(workingDir, '.wasm-functions'),
);

void (async (): Promise<void> => {
  const { dirName, newVersion, currentVersion } = await collectBumpInput();
  const sourceDir = path.join(workingDir, 'functions', dirName, currentVersion);
  const targetDir = path.join(workingDir, 'functions', dirName, newVersion);

  try {
    fs.copySync(sourceDir, targetDir);

    if (isWasmFunctionProject) {
      replaceVersionInWitFile({
        currentVersion,
        dirName,
        newVersion,
        targetDir,
      });

      replaceVersionInCargoTomlFile({
        currentVersion,
        newVersion,
        targetDir,
      });
    }
    console.log(`${check} Version bumped to ${path.join(dirName, newVersion)}`);
  } catch {
    console.log(
      `${cross} Failed to bump version to  ${path.join(dirName, newVersion)}`,
    );
  }
})();
