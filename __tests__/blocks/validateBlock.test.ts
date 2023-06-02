import fs from 'fs-extra';
import test, { ExecutionContext } from 'ava';
import {
  validateBlockDependencies,
  getErrorMessage,
  validateBlockConfig,
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
  });

  t.is(errorMessage, 'One or more functions are not valid');
});

test('It returns an error for invalid block dependencies', (t: Context): void => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: ['moment'],
  });

  t.is(errorMessage, 'The following dependencies are not valid: moment');
});

test('It returns an error for invalid block dependencies without package specification', (t: Context): void => {
  const errorMessage = getErrorMessage({
    validFunctions: true,
    validBlockDependencies: false,
    invalidDependencies: [],
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
