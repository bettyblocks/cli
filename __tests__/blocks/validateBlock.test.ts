import {
  validateBlockDependencies,
  getErrorMessage,
  validateBlockConfig,
  validateBlock,
} from '../../src/validations/function-block-validations';
import { Block } from '../../src/blocks/blockDefinitions';

type Context = ExecutionContext<unknown>;

test('It validates invalid block dependencies', () => {
  const { valid, invalidDependencies } = validateBlockDependencies([
    'lodash',
    'moment',
  ]);

  expect(valid).toBe(false);
  expect(invalidDependencies.join()).toBe('moment');
});

test('It validates valid block dependencies', () => {
  const { valid, invalidDependencies } = validateBlockDependencies(['lodash']);

  expect(valid).toBe(true);
  expect(invalidDependencies.join()).toBe('');
});

test('It returns an error for invalid functions', () => {
  const errorMessage = getErrorMessage({
    validFunctions: false,
    validBlockDependencies: true,
    invalidDependencies: [],
    blockName: 'test-block',
    validBlockName: true,
  });

  expect(errorMessage).toBe('One or more functions are not valid');
});

test('It returns an error for invalid block dependencies', () => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: ['moment'],
    blockName: 'test-block',
    validBlockName: true,
  });

  expect(errorMessage).toBe('The following dependencies are not valid: moment');
});

test('It returns an error for invalid block dependencies without package specification', () => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: [],
    blockName: 'test-block',
    validBlockName: true,
  });

  expect(errorMessage).toBe('One of the block dependencies is not valid');
});

test('It validates if the there is a function defined', () => {
  const block: Block = {
    functions: ['./functions/function.js'],
    dependencies: ['lodash'],
    includes: [],
  };
  expect(validateBlockConfig(block)).toBe(true);
});

test('It validates if the there is no function defined', () => {
  const block: Block = {
    functions: [],
    dependencies: ['lodash'],
    includes: [],
  };
  expect(validateBlockConfig(block)).toBe(false);
});

test('It validates the block name on kebab case and is not valid', async () => {
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
  expect(errorMessage).toBe('test Block is not valid as it should be kebab case');
});

test('It validates the block name on kebab case and is valid', async () => {
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
