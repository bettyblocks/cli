import fs from 'fs-extra';
import path from 'path';
import { FunctionDefinition } from 'src/functions/functionDefinitions';
import { Block } from 'src/blocks/blockDefinitions';
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

export const validateBlockFunctions = async (
  blockFunctions: FunctionDefinition[],
): Promise<{ valid: boolean }> => {
  const baseFunctionsPath = path.join(workingDir, 'functions');
  console.log(`Validating functions in ${baseFunctionsPath}`);
  const config = new Config();
  const validator = new FunctionValidator(config, baseFunctionsPath);
  await validator.initSchema();
  const results = await validator.validateFunctions('', blockFunctions);
  let valid = true;
  results.forEach((result) => {
    if (result.status === 'error') {
      valid = false;
    }
    logValidationResult(result);
  });

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
