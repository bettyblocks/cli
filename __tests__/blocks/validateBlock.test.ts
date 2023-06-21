import test, { ExecutionContext } from 'ava';
import {
  validateBlockDependencies,
  getErrorMessage,
  validateBlockConfig,
  validateBlock,
} from '../../src/validations/function-block-validations';
import { Block } from '../../src/blocks/blockDefinitions';

type Context = ExecutionContext<unknown>;

test('It validates invalid block dependencies', (t: Context): void => {
  const { valid, invalidDependencies } = validateBlockDependencies([
    'lodash',
    'moment',
  ]);

  t.is(valid, false);
  t.is(invalidDependencies.join(), 'moment');
});

test('It validates valid block dependencies', (t: Context): void => {
  const { valid, invalidDependencies } = validateBlockDependencies(['lodash']);

  t.is(valid, true);
  t.is(invalidDependencies.join(), '');
});

test('It returns an error for invalid functions', (t: Context): void => {
  const errorMessage = getErrorMessage({
    validFunctions: false,
    validBlockDependencies: true,
    invalidDependencies: [],
    blockName: 'test-block',
    validBlockName: true,
  });

  t.is(errorMessage, 'One or more functions are not valid');
});

test('It returns an error for invalid block dependencies', (t: Context): void => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: ['moment'],
    blockName: 'test-block',
    validBlockName: true,
  });

  t.is(errorMessage, 'The following dependencies are not valid: moment');
});

test('It returns an error for invalid block dependencies without package specification', (t: Context): void => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: [],
    blockName: 'test-block',
    validBlockName: true,
  });

  t.is(errorMessage, 'One of the block dependencies is not valid');
});

test('It validates if the there is a function defined', (t: Context): void => {
  const block: Block = {
    functions: ['./functions/function.js'],
    dependencies: ['lodash'],
    includes: [],
  };
  t.is(validateBlockConfig(block), true);
});

test('It validates if the there is no function defined', (t: Context): void => {
  const block: Block = {
    functions: [],
    dependencies: ['lodash'],
    includes: [],
  };
  t.is(validateBlockConfig(block), false);
});

test('It validates the block name on kebab case and is not valid', async (t: Context): Promise<void> => {
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

  t.is(valid, false);
  t.is(errorMessage, 'test Block is not valid as it should be kebab case');
});

test('It validates the block name on kebab case and is valid', async (t: Context): Promise<void> => {
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

  t.is(valid, true);
});
