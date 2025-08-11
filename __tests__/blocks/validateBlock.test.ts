import { expect, test } from 'bun:test';

import type { Block } from '../../src/blocks/blockDefinitions';
import {
  getErrorMessage,
  validateBlock,
  validateBlockConfig,
  validateBlockDependencies,
} from '../../src/validations/function-block-validations';

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
    blockName: 'test-block',
    invalidDependencies: [],
    validBlockDependencies: true,
    validBlockName: true,
    validFunctions: false,
  });

  expect(errorMessage).toBe('One or more functions are not valid');
});

test('It returns an error for invalid block dependencies', (): void => {
  const errorMessage = getErrorMessage({
    blockName: 'test-block',
    invalidDependencies: ['moment'],
    validBlockDependencies: false,
    validBlockName: true,
    validFunctions: true,
  });

  expect(errorMessage).toBe('The following dependencies are not valid: moment');
});

test('It returns an error for invalid block dependencies without package specification', (): void => {
  const errorMessage = getErrorMessage({
    blockName: 'test-block',
    invalidDependencies: [],
    validBlockDependencies: false,
    validBlockName: true,
    validFunctions: true,
  });

  expect(errorMessage).toBe('One of the block dependencies is not valid');
});

test('It validates if the there is a function defined', (): void => {
  const block: Block = {
    dependencies: ['lodash'],
    functions: ['./functions/function.js'],
    includes: [],
  };
  expect(validateBlockConfig(block)).toEqual(true);
});

test('It validates if the there is no function defined', (): void => {
  const block: Block = {
    dependencies: ['lodash'],
    functions: [],
    includes: [],
  };
  expect(validateBlockConfig(block)).toEqual(false);
});

test('It validates the block name on kebab case and is not valid', async (): Promise<void> => {
  const block: Block = {
    dependencies: ['lodash'],
    functions: ['sayHello 1.0'],
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
}, 10000); // override default timeout, because validateBlock() is slow

test('It validates the block name on kebab case and is valid', async (): Promise<void> => {
  const block: Block = {
    dependencies: ['lodash'],
    functions: ['sayHello 1.0'],
    includes: [],
  };

  const { valid } = await validateBlock({
    block,
    blockFunctions: [],
    blockName: 'test-block',
  });

  expect(valid).toBe(true);
}, 10000); // override default timeout, because validateBlock() is slow
