import { stripVTControlCharacters } from '__tests__/utils';
import { expect, test } from 'bun:test';

import type { Prefab, PrefabAction } from '../../src/types';
import { EVENT_KIND } from '../../src/validations/constants';
import validatePrefabs from '../../src/validations/prefab';

test('Pass without actions array', (): void => {
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

test('Pass when actions is empty list', (): void => {
  const prefab = {
    actions: [],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Throw when action has no name', (): void => {
  const prefab = {
    actions: [{} as PrefabAction],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow();
});

test('Throw when action has no useNewRuntime', (): void => {
  const prefab = {
    actions: [{ name: 'foo' } as PrefabAction],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "actions[0].useNewRuntime" is required at prefab: Prefab`,
  );
});

test('Throw when useNewRuntime is not a boolean', (): void => {
  const prefab = {
    actions: [
      {
        name: 'foo',
        useNewRuntime: '1',
      } as unknown as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "actions[0].useNewRuntime" must be a boolean at prefab: Prefab`,
  );
});

test('Throw when action has no ref', (): void => {
  const prefab = {
    actions: [{ name: 'foo', useNewRuntime: true } as PrefabAction],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "actions[0].ref" is required at prefab: Prefab`,
  );
});

test('Throw when action has no id inside ref', (): void => {
  const prefab = {
    actions: [
      {
        name: 'foo',
        ref: { endpointId: 'bar' },
        useNewRuntime: true,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "actions[0].ref.id" is required at prefab: Prefab`,
  );
});

test('Throw when action has no endpointId inside ref', (): void => {
  const prefab = {
    actions: [
      {
        name: 'foo',
        ref: { id: 'bar' },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "actions[0].ref.endpointId" is required at prefab: Prefab`,
  );
});

test('Pass when actions contains an event of a kind supported by the old runtime', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'create',
          },
          {
            kind: 'send_mail',
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when actions contains an event of a kind supported by the new runtime', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'authenticate_user',
          },
        ],
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Throw when actions contains an event of an unsupported kind', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'authenticate_user',
          },
          {
            kind: 'send_mail',
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "actions[0].events[0].kind" must be one of [${EVENT_KIND.join(
      ', ',
    )}] at prefab: Prefab`,
  );
});

test('Pass when a update event has options', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'update',
            options: {
              assign: [
                {
                  leftHandSide: '#propertyId',
                  ref: {
                    path: ['#customModelVariableId', `#attribute_#property.id`],
                  },
                },
              ],
              ref: {
                object: '#objectVariableId',
              },
            },
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when create event has valid options', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'create',
            options: {
              assign: [
                {
                  leftHandSide: '#propertyId',
                  ref: {
                    path: ['#customModelVariableId', `#attribute_#property.id`],
                  },
                },
              ],
              modelId: '#modelId',
              ref: {
                customModel: '#customModelId',
              },
            },
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when a delete event has valid options', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'delete',
            options: {
              ref: {
                object: '#objectVariableId',
              },
            },
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when a authenticate_user event has valid options', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'authenticate_user',
            options: {
              authenticationProfileId: '',
              ref: {
                jwtAs: '#jwt',
                password: '#passwordVariableId',
                username: '#usernameVariableId',
              },
            },
          },
        ],
        name: 'Login user action',
        options: {
          ref: {
            result: '#jwt',
          },
        },
        ref: {
          id: '#loginActionId',
        },
        useNewRuntime: true,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when a update event has no options', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'update',
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Throw when a assign event has options', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'assign',
            options: {
              assign: [
                {
                  leftHandSide: '#propertyId',
                  ref: {
                    path: ['#customModelVariableId', `#attribute_#property.id`],
                  },
                },
              ],
              ref: {
                object: '#customModelId',
              },
            },
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `Property: "actions[0].events[0].options" is not allowed at prefab: Prefab`,
  );
});

test('Pass when actions array contains a valid action object', (): void => {
  const prefab = {
    actions: [
      {
        events: [
          {
            kind: 'create',
          },
          {
            kind: 'send_mail',
          },
        ],
        name: 'action_1',
        ref: {
          endpointId: 'bar',
          id: 'foo',
        },
        useNewRuntime: false,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when action object does not contain any events', (): void => {
  const prefab = {
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Throw when component option has a value and a ref object with a value', (): void => {
  const prefab = {
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
      } as PrefabAction,
    ],
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        descendants: [],
        name: 'HelloWorld',
        options: [
          {
            configuration: {
              apiVersion: 'v1',
            },
            key: 'actionId',
            label: 'Action',
            ref: {
              value: 'foo',
            },
            type: 'ACTION',
            value: '',
          },
        ],
        type: 'COMPONENT',
      },
    ],
  } as Prefab;

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].value" is not allowed\n at prefab: Prefab\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs: [prefab], styles: {} });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('Pass when component option has a value and no ref', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        descendants: [],
        name: 'HelloWorld',
        options: [
          {
            configuration: {
              apiVersion: 'v1',
            },
            key: 'actionId',
            label: 'Action',
            type: 'ACTION',
            value: '',
          },
        ],
      },
    ],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Pass when component option has a ref and no value', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        descendants: [],
        name: 'HelloWorld',
        options: [
          {
            configuration: {
              apiVersion: 'v1',
            },
            key: 'actionId',
            label: 'Action',
            ref: {
              value: 'foo',
            },
            type: 'ACTION',
          },
        ],
      },
    ],
  } as Prefab;

  expect(() =>
    validatePrefabs({ prefabs: [prefab], styles: {} }),
  ).not.toThrow();
});

test('Throw when component option has a ref when type is not ACTION', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        descendants: [],
        name: 'HelloWorld',
        options: [
          {
            key: 'title',
            label: 'Title',
            ref: {
              value: 'foo',
            },
            type: 'TEXT',
          },
        ],
      },
    ],
  } as Prefab;

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].ref.value" is not allowed\n at prefab: Prefab\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs: [prefab], styles: {} });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('Throw when component option has a ref object without a value', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        descendants: [],
        name: 'HelloWorld',
        options: [
          {
            configuration: {
              apiVersion: 'v1',
            },
            key: 'actionId',
            label: 'Action',
            ref: {},
            type: 'ACTION',
          },
        ],
      },
    ],
  } as unknown as Prefab;

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].ref.value" is required\n at prefab: Prefab\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs: [prefab], styles: {} });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('Throw when component option has neither ref nor value', (): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        descendants: [],
        name: 'HelloWorld',
        options: [
          {
            configuration: {
              apiVersion: 'v1',
            },
            key: 'actionId',
            label: 'Action',
            type: 'ACTION',
          },
        ],
      },
    ],
  } as unknown as Prefab;

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].ref" is required\n at prefab: Prefab\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs: [prefab], styles: {} });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('Throw when multiple action reference the same id', (): void => {
  const prefab = {
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
      },
      {
        name: 'action_2',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
      },
    ],
    category: 'CONTENT',
    descendants: [],
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        name: 'HelloWorld',
        options: [
          {
            configuration: { apiVersion: 'v1' },
            key: 'actionId',
            label: 'Action',
            ref: { value: 'foo' },
            type: 'ACTION',
          },
        ],
      },
    ],
  } as unknown as Prefab;

  expect(() => validatePrefabs({ prefabs: [prefab], styles: {} })).toThrow(
    `The name "foo" is used for multiple actions`,
  );
});
