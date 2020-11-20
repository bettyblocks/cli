import test, { ExecutionContext } from 'ava';

import { Prefab, PrefabAction } from '../../src/types';
import { EVENT_KIND } from '../../src/validations/constants';
import validatePrefabs from '../../src/validations/prefab';

type Context = ExecutionContext<unknown>;

test('Pass without actions array', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab]);

  t.pass();
});

test('Pass when actions is empty list', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab]);

  t.pass();
});

test('Throw when action has no name', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{} as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].name" is required at prefab: Prefab
`,
  });
});

test('Throw when action has no useNewRuntime', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{ name: 'foo' } as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].useNewRuntime" is required at prefab: Prefab
`,
  });
});

test('Throw when useNewRuntime is not a boolean', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      ({
        name: 'foo',
        useNewRuntime: '1',
      } as unknown) as PrefabAction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].useNewRuntime" must be a boolean at prefab: Prefab
`,
  });
});

test('Throw when action has no ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{ name: 'foo', useNewRuntime: true } as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].ref" is required at prefab: Prefab
`,
  });
});

test('Throw when action has no id inside ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{ name: 'foo', useNewRuntime: true, ref: {} } as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].ref.id" is required at prefab: Prefab
`,
  });
});

test('Pass when actions contains an event of a kind supported by the old runtime', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
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

  validatePrefabs([prefab]);

  t.pass();
});

test('Pass when actions contains an event of a kind supported by the new runtime', (t: Context): void => {
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

  validatePrefabs([prefab]);

  t.pass();
});

test('Throw when actions contains an event of an unsupported kind', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
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

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].events[0].kind" must be one of [${EVENT_KIND.join(
      ', ',
    )}] at prefab: Prefab
`,
  });
});

test('Pass when actions array contains a valid action object', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
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

  validatePrefabs([prefab]);

  t.pass();
});

test('Pass when action object does not contain any events', (t: Context): void => {
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

  validatePrefabs([prefab]);

  t.pass();
});

test('Throw when component option has a value and a ref object with a value', (t: Context): void => {
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

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "structure[0]" failed custom validation because 
Build error in component HelloWorld: "options[0].value" is not allowed
 at prefab: Prefab
`,
  });
});

test('Pass when component option has a value and no ref', (t: Context): void => {
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

  validatePrefabs([prefab]);

  t.pass();
});

test('Pass when component option has a ref and no value', (t: Context): void => {
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

  validatePrefabs([prefab]);

  t.pass();
});

test('Throw when component option has a ref when type is not ACTION', (t: Context): void => {
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

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "structure[0]" failed custom validation because 
Build error in component HelloWorld: "options[0].ref" is not allowed
 at prefab: Prefab
`,
  });
});

test('Throw when component option has a ref object without a value', (t: Context): void => {
  const prefab = ({
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
  } as unknown) as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "structure[0]" failed custom validation because 
Build error in component HelloWorld: "options[0].ref.value" is required
 at prefab: Prefab
`,
  });
});

test('Throw when component option has neither ref nor value', (t: Context): void => {
  const prefab = ({
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
  } as unknown) as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "structure[0]" failed custom validation because 
Build error in component HelloWorld: "options[0].ref" is required
 at prefab: Prefab
`,
  });
});

test('Throw when multiple action reference the same id', (t: Context): void => {
  const prefab = ({
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
  } as unknown) as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
The name "foo" is used for multiple actions
`,
  });
});
