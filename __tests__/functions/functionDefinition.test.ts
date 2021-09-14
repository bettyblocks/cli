import fs from 'fs-extra';
import test, { ExecutionContext } from 'ava';
import path from 'path';

import {
  functionDefinition,
  functionDefinitions,
  functionDefinitionPath,
  isFunctionDefinition,
  newFunctionDefinition,
  stringifyDefinitions
} from '../../src/functions/functionDefinitions';

type Context = ExecutionContext<unknown>;

const supportDir = path.join(process.cwd(), '__tests__/support/');
const functionsPath = path.join(supportDir, 'functions');

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
    schema: {
      name: 'sayHello'
    }
  });
});

test('creating a new functionDefinition', async (t: Context): Promise<void> => {
  const tmpFunctionsDir = 'tmpFunctions' + Math.random().toString()
  const tmpFunctionsPath = path.join(supportDir, tmpFunctionsDir);
  newFunctionDefinition(tmpFunctionsPath, 'ciao-mondo');

  const functionPath = path.join(tmpFunctionsPath, 'ciao-mondo');
  const {schema} = functionDefinition(functionPath);

  fs.removeSync(tmpFunctionsPath);
  t.like(schema, {
    name: 'ciaoMondo'
  });
});

test('functionDefinitions for a directory with functions', async (t: Context): Promise<void> => {
  const [{schema}] = functionDefinitions(functionsPath)
  t.like(schema, {
      name: 'sayHello'
    }
  );
});

test('functionDefinitions for a directory without functions', async (t: Context): Promise<void> => {
  const wrongFunctionsPath = supportDir;
  t.deepEqual(functionDefinitions(wrongFunctionsPath), []);
});

test('stringifying function definitions', async (t: Context): Promise<void> => {
  const expected = '{"sayHello":{"description":"Say Hello to the world","name":"sayHello","label":"Say Hello","category":"Misc","icon":"CreateIcon","options":"[{\\"meta\\":{\\"type\\":\\"String\\",\\"io\\":\\"in\\"},\\"name\\":\\"name\\",\\"label\\":\\"Name\\",\\"info\\":\\"The name that\'s going to be used to say hello to the world!\\",\\"advanced\\":false,\\"configuration\\":{\\"placeholder\\":\\"Betty Blocks\\"}}]","yields":"none"}}'
  const definitions = functionDefinitions(functionsPath);
  t.is(stringifyDefinitions(definitions), expected);
});