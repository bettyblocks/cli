import test, { ExecutionContext } from 'ava';
import path from 'path';

import {
  functionDefinition,
  functionDefinitions,
  functionDefinitionPath,
  isFunctionDefinition
} from '../../src/functions/functionDefinitions';

type Context = ExecutionContext<unknown>;

test('functionDefinitionPath', async(t: Context): Promise<void> => {
  t.is(functionDefinitionPath('/functions/loop'), '/functions/loop/function.json');
})

test('isFunctionDefinition', async(t: Context): Promise<void> => {
  const correctPath = path.join(process.cwd(), '__tests__/support/functions/say-hello')
  t.true(isFunctionDefinition(correctPath));

  const incorrectPath = path.join(process.cwd(), '__tests__/support/functions/say-goodbye')
  t.false(isFunctionDefinition(incorrectPath));
})

test('functionDefinition', async(t: Context): Promise<void> => {
  const functionPath = path.join(process.cwd(), '__tests__/support/functions/say-hello')
  t.like(functionDefinition(functionPath), {
    name: 'sayHello'
  });
})

test('functionDefinitions for a directory with functions', async(t: Context): Promise<void> => {
  const functionsPath = path.join(process.cwd(), '__tests__/support/functions');
  t.like(functionDefinitions(functionsPath), {
    sayHello: {
      name: 'sayHello'
    }
  });
})

test('functionDefinitions for a directory without functions', async(t: Context): Promise<void> => {
  const functionsPath = path.join(process.cwd(), '__tests__/support');
  t.deepEqual(functionDefinitions(functionsPath), {});
})