import test, { ExecutionContext } from 'ava';

import { Prefab, PrefabAction } from '../../src/types';
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

test('Throw when action has no newRuntime', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{ name: 'foo' } as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].newRuntime" is required at prefab: Prefab
`,
  });
});

test('Throw when newRuntime is not a boolean', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [({ name: 'foo', newRuntime: '1' } as unknown) as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].newRuntime" must be a boolean at prefab: Prefab
`,
  });
});

test('Throw when action has no ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [{ name: 'foo', newRuntime: true } as PrefabAction],
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
    actions: [{ name: 'foo', newRuntime: true, ref: {} } as PrefabAction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "actions[0].ref.id" is required at prefab: Prefab
`,
  });
});

test('Pass when actions contains an event of an supported kind', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    actions: [
      {
        name: 'action_1',
        ref: {
          id: 'foo',
        },
        newRuntime: true,
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
        newRuntime: true,
        events: [
          {
            kind: 'switch',
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
Property: "actions[0].events[0].kind" must be one of [action, assign, authenticate_user, auto_increment_generate, auto_increment_set, condition, condition_group, create, create_betty_user, custom_function, delete, export, expression, external_function, group, http_request, import, login_web_user, logout_web_user, loop, pdf_generate, pdf_merge, redirect_web_page, render_web_template, send_mail, sftp_download, sftp_list, sftp_upload, update, zip] at prefab: Prefab
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
        newRuntime: true,
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
        newRuntime: true,
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
        newRuntime: true,
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
