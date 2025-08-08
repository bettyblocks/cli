import { test, expect } from 'bun:test';
import {
  validateBlockDependencies,
  getErrorMessage,
  validateBlockConfig,
  validateBlock,
} from '../../src/validations/function-block-validations';
import { Block } from '../../src/blocks/blockDefinitions';

test('It validates invalid block dependencies', (): void => {
  const { valid, invalidDependencies } = validateBlockDependencies([
    'lodash',
    'moment',
  ]);

  expect(valid).toBe(false);
  expect(invalidDependencies.join()).toEqual('moment');
});

test('It validates valid block dependencies', (): void => {
  const { valid, invalidDependencies } = validateBlockDependencies(['lodash']);

  expect(valid).toBe(true);
  expect(invalidDependencies.join()).toEqual('');
});

test('It returns an error for invalid functions', (): void => {
  const errorMessage = getErrorMessage({
    validFunctions: false,
    validBlockDependencies: true,
    invalidDependencies: [],
    blockName: 'test-block',
    validBlockName: true,
  });

  expect(errorMessage).toBe('One or more functions are not valid');
});

test('It returns an error for invalid block dependencies', (): void => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: ['moment'],
    blockName: 'test-block',
    validBlockName: true,
  });

  expect(errorMessage).toBe('The following dependencies are not valid: moment');
});

test('It returns an error for invalid block dependencies without package specification', (): void => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: [],
    blockName: 'test-block',
    validBlockName: true,
  });

  expect(errorMessage).toBe('One of the block dependencies is not valid');
});

test('It validates if the there is a function defined', (): void => {
  const block: Block = {
    functions: ['./functions/function.js'],
    dependencies: ['lodash'],
    includes: [],
  };
  expect(validateBlockConfig(block)).toEqual(true);
});

test('It validates if the there is no function defined', (): void => {
  const block: Block = {
    functions: [],
    dependencies: ['lodash'],
    includes: [],
  };
  expect(validateBlockConfig(block)).toEqual(false);
});

test('It validates the block name on kebab case and is not valid', async (): Promise<void> => {
  const block: Block = {
    functions: ['sayHello 1.0'],
    dependencies: ['lodash'],
    includes: [],
  };

  const { valid, errorMessage } = await validateBlock({
    block,
    blockFunctions: [],
    blockName: 'test Block',
  });

  expect(valid).toBe(false);
  expect(errorMessage).toBe(
    'test Block is not valid as it should be kebab case',
  );
});

test('It validates the block name on kebab case and is valid', async (): Promise<void> => {
  const block: Block = {
    functions: ['sayHello 1.0'],
    dependencies: ['lodash'],
    includes: [],
  };

  const { valid } = await validateBlock({
    block,
    blockFunctions: [],
    blockName: 'test-block',
  });

  expect(valid).toBe(true);
});
