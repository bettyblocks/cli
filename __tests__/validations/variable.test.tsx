import test, { ExecutionContext } from 'ava';

import { Prefab, PrefabVariable } from '../../src/types';
import validatePrefabs from '../../src/validations/prefab';

type Context = ExecutionContext<unknown>;

test('Pass without variables array', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});

  t.pass();
});

test('Pass when variables array is the empty list', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});

  t.pass();
});

test('Throw when variable kind is unsupported', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      ({
        name: 'foo',
        kind: 'collection',
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
      } as unknown) as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab], {}), {
    message: `
Property: "variables[0].kind" must be one of [construct, object, string, integer] at prefab: Prefab
`,
  });
});

test('Throw when construct variable does not have a modelId', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
        options: {},
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab], {}), {
    message: `
Property: "variables[0].options.modelId" is required at prefab: Prefab
`,
  });
});

test('Throw when construct variable does not have a name', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      { kind: 'construct', options: { modelId: '' } } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab], {}), {
    message: `
Property: "variables[0].name" is required at prefab: Prefab
`,
  });
});

test('Throw when construct variable does not have a ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        ref: {
          endpointId: '#endpointId',
          id: '#variableId',
        },
        options: { modelId: '' },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab], {}), {
    message: `
Property: "variables[0].options.ref" is required at prefab: Prefab
`,
  });
});

test('Throw when construct variable does not have a id ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        ref: {
          endpointId: '#endpointId',
        },
        options: {
          modelId: '',
        },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab], {}), {
    message: `
Property: "variables[0].ref.id" is required at prefab: Prefab
`,
  });
});

test('Throw when construct variable does not have a customModelId ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        ref: {
          id: '#variableId',
          endpointId: '#endpointId',
        },
        options: {
          modelId: '',
          ref: {},
        },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab], {}), {
    message: `
Property: "variables[0].options.ref.customModelId" is required at prefab: Prefab
`,
  });
});

test('Pass for valid construct variable', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        name: 'foo',
        ref: {
          id: '#variableId',
          endpointId: '#endpointId',
        },
        options: {
          modelId: '',
          ref: { customModelId: 'baz' },
        },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});

  t.pass();
});

test('Pass when using a string variable', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'string',
        name: 'password',
        ref: {
          id: '#passwordVariableId',
          actionId: '#loginActionId',
        },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});

  t.pass();
});

test('Pass when using a object variable', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'object',
        name: 'form_object',
        ref: {
          id: '#objectVariableId',
          endpointId: '#endpointId',
        },
        options: {
          modelId: '',
        },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});

  t.pass();
});
