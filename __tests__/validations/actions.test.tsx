import { Prefab, PrefabAction } from '../../src/types';
import { EVENT_KIND } from '../../src/validations/constants';
import validatePrefabs from '../../src/validations/prefab';
import toRegexLines from '../support/toRegexLines';

test('Pass without actions array', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when actions is empty list', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when action has no name', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{} as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;
});

test('Throw when action has no useNewRuntime', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{ name: 'foo' } as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "actions[0].useNewRuntime" is required at prefab: Prefab',
  );
});

test('Throw when useNewRuntime is not a boolean', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'foo',
        useNewRuntime: '1',
      } as unknown as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "actions[0].useNewRuntime" must be a boolean at prefab: Prefab',
  );
});

test('Throw when action has no ref', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{ name: 'foo', useNewRuntime: true } as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "actions[0].ref" is required at prefab: Prefab',
  );
});

test('Throw when action has no id inside ref', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'foo',
        useNewRuntime: true,
        ref: { endpointId: 'bar' },
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "actions[0].ref.id" is required at prefab: Prefab',
  );
});

test('Throw when action has no endpointId inside ref', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'foo',
        useNewRuntime: false,
        ref: { id: 'bar' },
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "actions[0].ref.endpointId" is required at prefab: Prefab',
  );
});

test('Pass when actions contains an event of a kind supported by the old runtime', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
        events: [
          {
            kind: 'create',
          },
          {
            kind: 'send_mail',
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when actions contains an event of a kind supported by the new runtime', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
        events: [
          {
            kind: 'authenticate_user',
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Throw when actions contains an event of an unsupported kind', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
        events: [
          {
            kind: 'authenticate_user',
          },
          {
            kind: 'send_mail',
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  const expectedMessage = toRegexLines(`
  Property: "actions[0].events[0].kind" must be one of [${EVENT_KIND.join(
    ', ',
  )}] at prefab: Prefab
  `);

  expect(() => validatePrefabs([prefab], {})).toThrowError(expectedMessage);
});

test('Pass when a update event has options', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
        events: [
          {
            kind: 'update',
            options: {
              ref: {
                object: '#objectVariableId',
              },
              assign: [
                {
                  leftHandSide: '#propertyId',
                  ref: {
                    path: ['#customModelVariableId', `#attribute_#property.id`],
                  },
                },
              ],
            },
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when create event has valid options', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
        events: [
          {
            kind: 'create',
            options: {
              modelId: '#modelId',
              ref: {
                customModel: '#customModelId',
              },
              assign: [
                {
                  leftHandSide: '#propertyId',
                  ref: {
                    path: ['#customModelVariableId', `#attribute_#property.id`],
                  },
                },
              ],
            },
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when a delete event has valid options', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
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
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when a authenticate_user event has valid options', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'Login user action',
        ref: {
          id: '#loginActionId',
        },
        options: {
          ref: {
            result: '#jwt',
          },
        },
        useNewRuntime: true,
        events: [
          {
            kind: 'authenticate_user',
            options: {
              authenticationProfileId: '',
              ref: {
                username: '#usernameVariableId',
                password: '#passwordVariableId',
                jwtAs: '#jwt',
              },
            },
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when a update event has no options', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
        events: [
          {
            kind: 'update',
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Throw when a assign event has options', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
        events: [
          {
            kind: 'assign',
            options: {
              ref: {
                object: '#customModelId',
              },
              assign: [
                {
                  leftHandSide: '#propertyId',
                  ref: {
                    path: ['#customModelVariableId', `#attribute_#property.id`],
                  },
                },
              ],
            },
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "actions[0].events[0].options" is not allowed at prefab: Prefab',
  );
});

test('Pass when actions array contains a valid action object', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
          endpointId: 'bar',
        },
        useNewRuntime: false,
        events: [
          {
            kind: 'create',
          },
          {
            kind: 'send_mail',
          },
        ],
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when action object does not contain any events', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Throw when component option has a value and a ref object with a value', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        useNewRuntime: true,
      } as PrefabAction,
    ],
    name: 'Prefab',
    structure: [
      {
        type: 'COMPONENT',
        name: 'HelloWorld',
        options: [
          {
            label: 'Action',
            key: 'actionId',
            value: '',
            ref: {
              value: 'foo',
            },
            type: 'ACTION',
            configuration: {
              apiVersion: 'v1',
            },
          },
        ],
        descendants: [],
      },
    ],
  } as Prefab;

  const expectedMessage = toRegexLines(
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].value" is not allowed\n at prefab: Prefab\n',
  );

  expect(() => validatePrefabs([prefab], {})).toThrowError(expectedMessage);
});

test('Pass when component option has a value and no ref', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        name: 'HelloWorld',
        options: [
          {
            label: 'Action',
            key: 'actionId',
            value: '',
            type: 'ACTION',
            configuration: {
              apiVersion: 'v1',
            },
          },
        ],
        descendants: [],
      },
    ],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when component option has a ref and no value', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        name: 'HelloWorld',
        options: [
          {
            label: 'Action',
            key: 'actionId',
            ref: {
              value: 'foo',
            },
            type: 'ACTION',
            configuration: {
              apiVersion: 'v1',
            },
          },
        ],
        descendants: [],
      },
    ],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Throw when component option has a ref when type is not ACTION', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        name: 'HelloWorld',
        options: [
          {
            type: 'TEXT',
            label: 'Title',
            key: 'title',
            ref: {
              value: 'foo',
            },
          },
        ],
        descendants: [],
      },
    ],
  } as Prefab;

  const expectedMessage = toRegexLines(
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].ref.value" is not allowed\n at prefab: Prefab\n',
  );

  expect(() => validatePrefabs([prefab], {})).toThrowError(expectedMessage);
});

test('Throw when component option has a ref object without a value', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        name: 'HelloWorld',
        options: [
          {
            label: 'Action',
            key: 'actionId',
            ref: {},
            type: 'ACTION',
            configuration: {
              apiVersion: 'v1',
            },
          },
        ],
        descendants: [],
      },
    ],
  } as unknown as Prefab;

  const expectedMessage = toRegexLines(
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].ref.value" is required\n at prefab: Prefab\n',
  );

  expect(() => validatePrefabs([prefab], {})).toThrowError(expectedMessage);
});

test('Throw when component option has neither ref nor value', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        name: 'HelloWorld',
        options: [
          {
            label: 'Action',
            key: 'actionId',
            type: 'ACTION',
            configuration: {
              apiVersion: 'v1',
            },
          },
        ],
        descendants: [],
      },
    ],
  } as unknown as Prefab;

  const expectedMessage = toRegexLines(
    'Property: "structure[0]" failed custom validation because \nBuild error in component HelloWorld: "options[0].ref" is required\n at prefab: Prefab',
  );

  const error = expect(() => validatePrefabs([prefab], {})).toThrowError(
    expectedMessage,
  );
});

test('Throw when multiple action reference the same id', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [
      {
        name: 'HelloWorld',
        options: [
          {
            label: 'Action',
            key: 'actionId',
            ref: {
              value: 'foo',
            },
            type: 'ACTION',
            configuration: {
              apiVersion: 'v1',
            },
          },
        ],
        descendants: [],
      },
    ],
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
  } as unknown as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'The name "foo" is used for multiple actions',
  );
});
