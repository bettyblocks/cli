import fs from 'fs-extra';
import path from 'path';
import { FunctionDefinition } from 'src/functions/functionDefinitions';
import { Block } from 'src/blocks/blockDefinitions';
import chalk from 'chalk';
import {
  FunctionValidator,
  logValidationResult,
} from '../../functions/validations';
import Config from '../../functions/config';

const workingDir = process.cwd();

export const validateBlockConfig = ({ functions }: Block) => !!functions.length;

const validateBlockName = (name: string): boolean => {
  const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return kebabCaseRegex.test(name);
};

export const validateBlockDependencies = (
  dependencies: string[],
): { valid: boolean; invalidDependencies: string[] } => {
  const packageJson = fs.readJsonSync(
    path.join(workingDir, 'package.json'),
  ) as { dependencies: { [key: string]: string } };
  const packageJsonDependencies = Object.keys(packageJson.dependencies);
  const invalidDependencies = dependencies.filter(
    (dependency) => !packageJsonDependencies.includes(dependency),
  );
  if (invalidDependencies.length) {
    return { valid: false, invalidDependencies };
  }
  return { valid: true, invalidDependencies: [] };
};

const validateBlockFunctions = async (blockFunctions: FunctionDefinition[]) => {
  const baseFunctionsPath = path.join(workingDir, 'functions');
  const config = new Config();
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();

  console.log(chalk.bold(`Validating functions in ${baseFunctionsPath}`));

  const results = await validator.validateFunctions('', blockFunctions);
  results.forEach(logValidationResult);

  const valid = results.every((result) => result.status === 'ok');

  if (valid) {
    console.log(
      `\n${chalk.green.underline(
        `✔ All your block functions are valid and ready to be published!`,
      )}`,
    );
  } else {
    console.log(
      `\n${chalk.red.underline(
        `✖ Certain functions in your project are invalid.`,
      )}`,
    );
  }

  return { valid };
};

export const getErrorMessage = ({
  validFunctions,
  validBlockDependencies,
  validBlockName,
  invalidDependencies = [],
  blockName,
}: {
  blockName: string;
  validFunctions: boolean;
  validBlockDependencies: boolean;
  validBlockName: boolean;
  invalidDependencies: string[];
}) => {
  if (!validBlockName) {
    return `${blockName} is not valid as it should be kebab case`;
  }

  if (!validFunctions) {
    return 'One or more functions are not valid';
  }

  if (!validBlockDependencies && invalidDependencies.length) {
    return `The following dependencies are not valid: ${invalidDependencies.join(
      ', ',
    )}`;
  }

  if (!validBlockDependencies && !invalidDependencies.length) {
    return 'One of the block dependencies is not valid';
  }

  return 'Something went wrong';
};

export const validateBlock = async ({
  block: { dependencies },
  blockFunctions,
  blockName,
}: {
  block: Block;
  blockFunctions: FunctionDefinition[];
  blockName: string;
}) => {
  const { valid: validFunctions } = await validateBlockFunctions(
    blockFunctions,
  );
  const { valid: validBlockDependencies, invalidDependencies } =
    validateBlockDependencies(dependencies);

  const validBlockName = validateBlockName(blockName);

  return {
    valid: validFunctions && validBlockDependencies && validBlockName,
    errorMessage: getErrorMessage({
      validFunctions,
      validBlockDependencies,
      validBlockName,
      invalidDependencies,
      blockName,
    }),
  };
};
