import fs from 'fs-extra';
import test, { ExecutionContext } from 'ava';
import path from 'path';

import {
  functionDefinition,
  functionDefinitions,
  functionDefinitionPath,
  generateIndex,
  isFunctionDefinition,
  isFunctionVersion,
  newFunctionDefinition,
  stringifyDefinitions,
} from '../../src/functions/functionDefinitions';

type Context = ExecutionContext<unknown>;

const supportDir = path.join(process.cwd(), '__tests__/support/');
const functionsPath = path.join(supportDir, 'functions');

test('functionDefinitionPath', async (t: Context): Promise<void> => {
  t.is(
    functionDefinitionPath('/functions/loop/1.0'),
    '/functions/loop/1.0/function.json',
  );
});

test('isFunctionDefinition', async (t: Context): Promise<void> => {
  const correctPath = path.join(functionsPath, 'say-hello', '1.0');
  t.true(isFunctionDefinition(correctPath));

  t.false(isFunctionDefinition(functionsPath));
});

test('isFunctionVersion', async (t: Context): Promise<void> => {
  const versioned = path.join(functionsPath, 'say-hello', '1.0');
  t.true(isFunctionVersion(versioned, functionsPath));

  const nonversioned = path.join(functionsPath, 'ooops');
  t.false(isFunctionVersion(nonversioned, functionsPath));

  const underversioned = path.join(functionsPath, 'sorry', '0.9');
  t.false(isFunctionVersion(underversioned, functionsPath));
});

test('functionDefinition', async (t: Context): Promise<void> => {
  const functionPath = path.join(functionsPath, 'say-hello', '1.0');
  t.like(functionDefinition(functionPath, functionsPath), {
    schema: {
      label: 'Say Hello',
    },
  });
});

test('creating a new functionDefinition', async (t: Context): Promise<void> => {
  const tmpFunctionsDir = `tmpFunctions${Math.random().toString()}`;
  const tmpFunctionsPath = path.join(supportDir, tmpFunctionsDir);
  newFunctionDefinition(tmpFunctionsPath, 'ciao-mondo');

  const functionPath = path.join(tmpFunctionsPath, 'ciao-mondo', '1.0');
  const { schema } = functionDefinition(functionPath, functionsPath);

  fs.removeSync(tmpFunctionsPath);
  t.like(schema, {
    label: 'Ciao Mondo',
  });
});

test('functionDefinitions for a directory with functions', async (t: Context): Promise<void> => {
  const [{ schema }] = functionDefinitions(functionsPath);
  t.like(schema, {
    label: 'Say Hello',
  });
});

test('functionDefinitions for a directory without functions', async (t: Context): Promise<void> => {
  const wrongFunctionsPath = supportDir;
  t.deepEqual(functionDefinitions(wrongFunctionsPath), []);
});

test('stringifying function definitions', async (t: Context): Promise<void> => {
  const expected =
    '[{"name":"sayHello","version":"1.0","description":"Say Hello to the world","label":"Say Hello","category":"Misc","icon":"{\\"name\\":\\"ChatIcon\\",\\"color\\":\\"Teal\\"}","options":"[{\\"meta\\":{\\"type\\":\\"Text\\"},\\"name\\":\\"name\\",\\"label\\":\\"Name\\",\\"info\\":\\"The name that\'s going to be used to say hello to the world!\\",\\"advanced\\":false,\\"configuration\\":{\\"placeholder\\":\\"Betty Blocks\\"}}]","yields":"NONE","paths":"{}"}]';
  const definitions = functionDefinitions(functionsPath);
  t.is(stringifyDefinitions(definitions), expected);
});

test('generating the package index.js', async (t: Context): Promise<void> => {
  const expected = `import { default as sayHello_1_0 } from './functions/say-hello/1.0';

const fn = {
  "sayHello 1.0": sayHello_1_0,
};

export default fn;
`;

  t.is(generateIndex(functionsPath), expected);
});
