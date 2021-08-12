import test, { ExecutionContext } from 'ava';
import path from 'path';

import {
  functionDefinition,
  functionDefinitions,
  functionDefinitionPath,
  isFunctionDefinition,
  stringifyDefinitions
} from '../../src/functions/functionDefinitions';

type Context = ExecutionContext<unknown>;

const functionsPath = path.join(process.cwd(), '__tests__/support/functions');

test('functionDefinitionPath', async (t: Context): Promise<void> => {
  t.is(functionDefinitionPath('/functions/loop'), '/functions/loop/function.json');
});

test('isFunctionDefinition', async (t: Context): Promise<void> => {
  const correctPath = path.join(functionsPath, 'say-hello');
  t.true(isFunctionDefinition(correctPath));

  const incorrectPath = path.join(functionsPath, 'say-goodbye')
  t.false(isFunctionDefinition(incorrectPath));
});

test('functionDefinition', async (t: Context): Promise<void> => {
  const functionPath = path.join(functionsPath, 'say-hello');
  t.like(functionDefinition(functionPath), {
    name: 'sayHello'
  });
});

test('functionDefinitions for a directory with functions', async (t: Context): Promise<void> => {
  t.like(functionDefinitions(functionsPath), {
    sayHello: {
      name: 'sayHello'
    }
  });
});

test('functionDefinitions for a directory without functions', async (t: Context): Promise<void> => {
  const wrongFunctionsPath = path.join(process.cwd(), '__tests__/support');
  t.deepEqual(functionDefinitions(wrongFunctionsPath), {});
});

test('stringifying function definitions', async (t: Context): Promise<void> => {
  const expected = '{"sayHello":{"description":"Say Hello to the world","name":"sayHello","label":"Say Hello","category":"Misc","icon":"CreateIcon","options":"[{\\"meta\\":{\\"type\\":\\"String\\",\\"io\\":\\"in\\"},\\"name\\":\\"name\\",\\"label\\":\\"Name\\",\\"info\\":\\"The name that\'s going to be used to say hello to the world!\\",\\"advanced\\":false,\\"configuration\\":{\\"placeholder\\":\\"Betty Blocks\\"}}]","yields":"none"}}'
  const definitions = functionDefinitions(functionsPath);
  t.is(stringifyDefinitions(definitions), expected);
});