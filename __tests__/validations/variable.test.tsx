import { expect, test } from 'bun:test';

import type { Prefab, PrefabVariable } from '../../src/types';
import validatePrefabs from '../../src/validations/prefab';

test('Pass without variables array', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when variables array is the empty list', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Throw when variable kind is unsupported', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'collection',
        name: 'foo',
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
      } as unknown as PrefabVariable,
    ],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "variables[0].kind" must be one of [construct, object, string, integer] at prefab: Prefab`,
  );
});

test('Throw when construct variable does not have a modelId', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        options: {},
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
      } as PrefabVariable,
    ],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "variables[0].options.modelId" is required at prefab: Prefab`,
  );
});

test('Throw when construct variable does not have a name', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      { kind: 'construct', options: { modelId: '' } } as PrefabVariable,
    ],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "variables[0].name" is required at prefab: Prefab`,
  );
});

test('Throw when construct variable does not have a ref', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        options: { modelId: '' },
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
      } as PrefabVariable,
    ],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "variables[0].options.ref" is required at prefab: Prefab`,
  );
});

test('Throw when construct variable does not have a id ref', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        options: {
          modelId: '',
        },
        ref: {
          endpointId: '#endpointId',
        },
      } as PrefabVariable,
    ],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "variables[0].ref.id" is required at prefab: Prefab`,
  );
});

test('Throw when construct variable does not have a customModelId ref', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        options: {
          modelId: '',
          ref: {},
        },
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
      } as PrefabVariable,
    ],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "variables[0].options.ref.customModelId" is required at prefab: Prefab`,
  );
});

test('Pass for valid construct variable', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        options: {
          modelId: '',
          ref: { customModelId: 'baz' },
        },
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
      } as PrefabVariable,
    ],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when using a string variable', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'string',
        name: 'password',
        ref: {
          actionId: '#loginActionId',
          id: '#passwordVariableId',
        },
      } as PrefabVariable,
    ],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when using a object variable', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
    variables: [
      {
        kind: 'object',
        name: 'form_object',
        options: {
          modelId: '',
        },
        ref: {
          endpointId: '#endpointId',
          id: '#objectVariableId',
        },
      } as PrefabVariable,
    ],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});
