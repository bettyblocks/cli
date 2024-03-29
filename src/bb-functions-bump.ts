import path from 'path';
import fs from 'fs-extra';
import program from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import { functionDefinitions } from './functions/functionDefinitions';

program.name('bb functions bump');

const check = chalk.green(`✔`);
const cross = chalk.red(`✖`);

const workingDir = process.cwd();
const baseFunctionsPath = path.join(workingDir, 'functions');

const collectBumpInput = async (): Promise<{
  newVersion: string;
  currentVersion: string;
  dirName: string;
}> => {
  const functionDir = (functionPath: string) =>
    path.basename(path.dirname(path.dirname(functionPath)));

  const versionedFunctions = functionDefinitions(baseFunctionsPath);

  const functions = versionedFunctions.reduce<{ [key: string]: string }>(
    (acc, { schema: { label }, path: functionPath }) => {
      const name = functionDir(functionPath);
      acc[name] = label;
      return acc;
    },
    {},
  );

  const dirName = (
    await prompts({
      type: 'select',
      name: 'functionName',
      message: 'Which function do you want to bump?',
      choices: Object.keys(functions).map((name) => ({
        title: functions[name],
        value: name,
      })),
      initial: 0,
    })
  ).functionName as string;

  const [[major, minor]] = versionedFunctions
    .filter(({ path: functionPath }) => functionDir(functionPath) === dirName)
    .sort(({ version: a }, { version: b }) => parseFloat(a) - parseFloat(b))
    .slice(-1)
    .map(({ version }) => version.split('.').map(Number));

  const majorVersion = `${major + 1}.0`;
  const minorVersion = `${major}.${minor + 1}`;

  const { bumpMajor } = (await prompts({
    type: 'toggle',
    name: 'bumpMajor',
    message: `To which version do you want to bump your function?`,
    initial: false,
    active: majorVersion,
    inactive: minorVersion,
  })) as { bumpMajor: boolean };

  return {
    newVersion: bumpMajor ? majorVersion : minorVersion,
    currentVersion: `${major}.${minor}`,
    dirName,
  };
};

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  const { dirName, newVersion, currentVersion } = await collectBumpInput();
  const sourceDir = path.join(workingDir, 'functions', dirName, currentVersion);
  const targetDir = path.join(workingDir, 'functions', dirName, newVersion);

  try {
    fs.copySync(sourceDir, targetDir);
    console.log(`${check} Version bumped to ${path.join(dirName, newVersion)}`);
  } catch {
    console.log(
      `${cross} Failed to bump version to  ${path.join(dirName, newVersion)}`,
    );
  }
})();
