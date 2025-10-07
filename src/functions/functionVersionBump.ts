import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

import {
  type FunctionDefinition,
  functionDefinitions,
} from './functionDefinitions';

const workingDir = process.cwd();
const baseFunctionsPath = path.join(workingDir, 'functions');

export const collectBumpInput = async (): Promise<{
  newVersion: string;
  currentVersion: string;
  dirName: string;
}> => {
  const versionedFunctions = await functionDefinitions(baseFunctionsPath);

  const functions = allFunctions(versionedFunctions);

  const dirName = (
    await prompts({
      choices: Object.keys(functions).map((name) => ({
        title: functions[name],
        value: name,
      })),
      initial: 0,
      message: 'Which function do you want to bump?',
      name: 'functionName',
      type: 'select',
    })
  ).functionName;

  const [major, minor] = majorAndMinorVersionBump(versionedFunctions, dirName);

  const majorVersion = `${major + 1}.0`;
  const minorVersion = `${major}.${minor + 1}`;

  const { bumpMajor } = (await prompts({
    active: majorVersion,
    inactive: minorVersion,
    initial: false,
    message: `To which version do you want to bump your function?`,
    name: 'bumpMajor',
    type: 'toggle',
  })) as { bumpMajor: boolean };

  return {
    currentVersion: `${major}.${minor}`,
    dirName,
    newVersion: bumpMajor ? majorVersion : minorVersion,
  };
};

const allFunctions = (
  versionedFunctions: FunctionDefinition[],
): Record<string, string> =>
  versionedFunctions.reduce<Record<string, string>>(
    (acc, { schema: { label }, path: functionPath }) => {
      const name = functionDir(functionPath);
      acc[name] = label;
      return acc;
    },
    {},
  );

const majorAndMinorVersionBump = (
  versionedFunctions: FunctionDefinition[],
  dirName: string,
): number[] =>
  versionedFunctions
    .filter(({ path: functionPath }) => functionDir(functionPath) === dirName)
    .sort(({ version: a }, { version: b }) => parseFloat(a) - parseFloat(b))
    .slice(-1)
    .map(({ version }) => version.split('.').map(Number))
    .flat();

const functionDir = (functionPath: string): string =>
  path.basename(path.dirname(path.dirname(functionPath)));

interface ReplaceVersionInWitFileProps {
  currentVersion: string;
  dirName: string;
  newVersion: string;
  targetDir: string;
}

export const replaceVersionInWitFile = ({
  currentVersion,
  dirName,
  newVersion,
  targetDir,
}: ReplaceVersionInWitFileProps): void => {
  const witFilePath = path.join(targetDir, 'wit', 'world.wit');
  const witFileContent = fs.readFileSync(witFilePath, 'utf8');
  const lowercasedFunctionName = dirName.toLowerCase();
  const updatedWitFileContent = witFileContent.replace(
    `${lowercasedFunctionName}@${currentVersion}.0`,
    `${lowercasedFunctionName}@${newVersion}.0`,
  );
  fs.writeFileSync(witFilePath, updatedWitFileContent, 'utf8');
};

interface ReplaceVersionInCargoTomlFileProps {
  currentVersion: string;
  newVersion: string;
  targetDir: string;
}

export const replaceVersionInCargoTomlFile = ({
  currentVersion,
  newVersion,
  targetDir,
}: ReplaceVersionInCargoTomlFileProps): void => {
  const cargoTomlFilePath = path.join(targetDir, 'Cargo.toml');
  const cargoTomlFileContent = fs.readFileSync(cargoTomlFilePath, 'utf8');
  const updatedCargoTomlFileContent = cargoTomlFileContent.replace(
    `version = "${currentVersion}.0"`,
    `version = "${newVersion}.0"`,
  );
  fs.writeFileSync(cargoTomlFilePath, updatedCargoTomlFileContent, 'utf8');
};
