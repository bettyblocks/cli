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

  validatePrefabs([prefab]);

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

  validatePrefabs([prefab]);

  t.pass();
});

test('Throw when variable does not have kind construct ', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [{} as PrefabVariable],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "variables[0].kind" is required at prefab: Prefab
`,
  });
});

test('Throw when variable kind is unsupported', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [({ kind: 'string' } as unknown) as PrefabVariable],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "variables[0].kind" must be [construct] at prefab: Prefab
`,
  });
});

test('Throw when variable does not have a modelId', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [{ kind: 'construct' } as PrefabVariable],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "variables[0].modelId" is required at prefab: Prefab
`,
  });
});

test('Throw when variable does not have a name', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [{ kind: 'construct', modelId: '' } as PrefabVariable],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "variables[0].name" is required at prefab: Prefab
`,
  });
});

test('Throw when variable does not have a ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      { kind: 'construct', modelId: '', name: 'foo' } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "variables[0].ref" is required at prefab: Prefab
`,
  });
});

test('Throw when variable does not have a endpointId ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        modelId: '',
        name: 'foo',
        ref: {},
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "variables[0].ref.endpointId" is required at prefab: Prefab
`,
  });
});

test('Throw when variable does not have a customModelId ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        modelId: '',
        name: 'foo',
        ref: { endpointId: 'bar' },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "variables[0].ref.customModelId" is required at prefab: Prefab
`,
  });
});

test('Pass for valid variable object', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    variables: [
      {
        kind: 'construct',
        modelId: '',
        name: 'foo',
        ref: { endpointId: 'bar', customModelId: 'baz' },
      } as PrefabVariable,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab]);

  t.pass();
});
