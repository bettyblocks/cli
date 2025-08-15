import { expect, test } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';

import {
  functionDefinition,
  functionDefinitionPath,
  functionDefinitions,
  generateIndex,
  isFunctionDefinition,
  isFunctionVersion,
  newFunctionDefinition,
  stringifyDefinitions,
} from '../../src/functions/functionDefinitions';

const supportDir = path.join(process.cwd(), '__tests__/support/');
const functionsPath = path.join(supportDir, 'functions');

test('functionDefinitionPath', async (): Promise<void> => {
  expect(functionDefinitionPath('/functions/loop/1.0')).toEqual(
    '/functions/loop/1.0/function.json',
  );
});

test('isFunctionDefinition', async (): Promise<void> => {
  const correctPath = path.join(functionsPath, 'say-hello', '1.0');
  expect(isFunctionDefinition(correctPath)).toBe(true);

  expect(isFunctionDefinition(functionsPath)).toBe(false);
});

test('isFunctionVersion', async (): Promise<void> => {
  const versioned = path.join(functionsPath, 'say-hello', '1.0');
  expect(isFunctionVersion(versioned, functionsPath)).toBe(true);

  const nonversioned = path.join(functionsPath, 'ooops');
  expect(isFunctionVersion(nonversioned, functionsPath)).toBe(false);

  const underversioned = path.join(functionsPath, 'sorry', '0.9');
  expect(isFunctionVersion(underversioned, functionsPath)).toBe(false);
});

test('functionDefinition', async (): Promise<void> => {
  const functionPath = path.join(functionsPath, 'say-hello', '1.0');
  expect(functionDefinition(functionPath, functionsPath)).toMatchObject({
    schema: {
      label: 'Say Hello',
    },
  });
});

test('creating a new functionDefinition', async (): Promise<void> => {
  const tmpFunctionsDir = `tmpFunctions${Math.random().toString()}`;
  const tmpFunctionsPath = path.join(supportDir, tmpFunctionsDir);
  newFunctionDefinition(tmpFunctionsPath, 'ciao-mondo');

  const functionPath = path.join(tmpFunctionsPath, 'ciao-mondo', '1.0');
  const { schema } = functionDefinition(functionPath, functionsPath);

  fs.removeSync(tmpFunctionsPath);
  expect(schema).toMatchObject({
    label: 'Ciao Mondo',
  });
});

test('functionDefinitions for a directory with functions', async (): Promise<void> => {
  const [{ schema }] = functionDefinitions(functionsPath);
  expect(schema).toMatchObject({
    label: 'Say Hello',
  });
});

test('functionDefinitions for a directory without functions', async (): Promise<void> => {
  const wrongFunctionsPath = supportDir;
  expect(functionDefinitions(wrongFunctionsPath)).toEqual([]);
});

test('stringifying function definitions', async (): Promise<void> => {
  const expected =
    '[{"name":"sayHello","version":"1.0","description":"Say Hello to the world","label":"Say Hello","category":"Misc","icon":{"name":"ChatIcon","color":"Teal"},"options":"[{\\"meta\\":{\\"type\\":\\"Text\\"},\\"name\\":\\"name\\",\\"label\\":\\"Name\\",\\"info\\":\\"The name that\'s going to be used to say hello to the world!\\",\\"advanced\\":false,\\"configuration\\":{\\"placeholder\\":\\"Betty Blocks\\"}}]","yields":"NONE","paths":"{}"}]';
  const definitions = functionDefinitions(functionsPath);
  expect(stringifyDefinitions(definitions)).toEqual(expected);
});

test('generating the package index.js', async (): Promise<void> => {
  const expected = `import { default as sayHello_1_0 } from './functions/say-hello/1.0';

const fn = {
  "sayHello 1.0": sayHello_1_0,
};

export default fn;
`;

  expect(generateIndex(functionsPath)).toEqual(expected);
});
