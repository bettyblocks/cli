import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export const validateWasmProjectStructure = (
  functionsPath: string,
  functionPaths: string[],
): boolean => {
  console.log(
    chalk.bold(`Validating wasm project structure in ${functionsPath}`),
  );

  const errors: string[] = [];

  for (const functionPath of functionPaths) {
    const functionDir = path.join(functionsPath, functionPath);

    const functionFiles = fs.readdirSync(functionDir, {
      withFileTypes: true,
    });
    const hasWasmFile = functionFiles.some((file) =>
      file.name.endsWith('.wasm'),
    );
    if (!hasWasmFile) {
      errors.push(`Missing .wasm file in ${functionPath}`);
    }
  }

  if (errors.length > 0) {
    errors.forEach((error) => {
      console.log(chalk.red(`✖ ${error}`));
    });
    console.log(
      `\n${chalk.red.underline(
        `✖ Certain functions in your project does not have a .wasm file.`,
      )}`,
    );
    return false;
  }

  console.log(
    `\n${chalk.green.underline(
      `✔ All your functions contains a .wasm file and ready to be published!`,
    )}`,
  );
  return true;
};

export const getAllWasmFunctionsWithVersions = (
  functionsPath: string,
): string[] => {
  if (!fs.existsSync(functionsPath)) {
    return [];
  }
  return fs
    .readdirSync(functionsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .flatMap((dirent) => {
      const functionDir = path.join(functionsPath, dirent.name);
      if (!fs.existsSync(functionDir)) {
        return [];
      }
      return fs
        .readdirSync(functionDir, { withFileTypes: true })
        .filter((subDirent) => subDirent.isDirectory())
        .map((subDirent) => `${dirent.name}/${subDirent.name}`);
    });
};
