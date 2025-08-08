import { test, expect } from 'bun:test';

import {
  InteractionType,
  Prefab,
  PrefabInteraction,
  PrefabInteractionParameter,
} from '../../src/types';
import validatePrefabs from '../../src/validations/prefab';

test('Pass without interactions array', (): void => {
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

test('Pass when interactions is the empty list', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Throw when a prefab interaction does not define a name', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{} as PrefabInteraction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].name" is required at prefab: Prefab`,
  );
});

test('Throw when a prefab interaction does not define a ref', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{ name: 'interaction 1' } as PrefabInteraction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].ref" is required at prefab: Prefab`,
  );
});

test('Throw when a prefab interaction does not define a type', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
      } as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].type" is required at prefab: Prefab`,
  );
});

test('Throw when a prefab interaction does not define a sourceEvent', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
      } as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].sourceEvent" is required at prefab: Prefab`,
  );
});

test('Throw when a prefab interaction type is not Global or Custom', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Login' as InteractionType,
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].type" must be one of [Global, Custom] at prefab: Prefab`,
  );
});

test('Throw when a prefab interaction does not define a sourceComponentId', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{ name: 'interaction 1', ref: {} } as PrefabInteraction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].ref.sourceComponentId" is required at prefab: Prefab`,
  );
});

test('Throw when a global prefab interaction does not define parameters', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Global',
      } as unknown as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].parameters" is required at prefab: Prefab`,
  );
});

test('Throw when a custom prefab interaction defines parameters', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [],
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        sourceEvent: 'Click',
        type: 'Custom',
      } as unknown as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].parameters" is not allowed at prefab: Prefab`,
  );
});

test('Throw when a global prefab interaction parameter does not define a parameter', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [{} as PrefabInteractionParameter],
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Global',
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].parameters[0].parameter" is required at prefab: Prefab`,
  );
});

test('Throw when a global prefab interaction parameter does not define a name', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [{ parameter: 'param1' } as PrefabInteractionParameter],
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Global',
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].parameters[0].name" is required at prefab: Prefab`,
  );
});

test('Throw when a global prefab interaction parameter does not reference a component', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [
          {
            name: 'option2',
            parameter: 'parameter1',
          } as PrefabInteractionParameter,
        ],
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Global',
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].parameters[0].ref" is required at prefab: Prefab`,
  );
});

test('Throw when a global prefab interaction parameter does not define a component id', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [
          {
            name: 'option2',
            parameter: 'parameter1',
            ref: {},
          } as PrefabInteractionParameter,
        ],
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Global',
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].parameters[0].ref.componentId" is required at prefab: Prefab`,
  );
});

test('Throw when a custom prefab interaction defines targetOptionName', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        targetOptionName: 'foo',
        ref: {
          sourceComponentId: 'component 1',
          targetComponentId: 'component 2',
        },
        sourceEvent: 'Click',
        type: 'Custom',
      } as unknown as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "interactions[0].targetOptionName" is not allowed at prefab: Prefab`,
  );
});
