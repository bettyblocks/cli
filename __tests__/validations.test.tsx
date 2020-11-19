import test, { ExecutionContext } from 'ava';

import {
  Action,
  Component,
  Interaction,
  InteractionParameter,
  InteractionType,
  Prefab,
} from '../src/types';
import validateComponents from '../src/validations/component';
import validatePrefabs from '../src/validations/prefab';

type Context = ExecutionContext<unknown>;

test('Throw when one of the components is invalid', (t: Context): void => {
  const components: { name: string }[] = [
    {
      name: 'HelloWorld',
    },
  ];

  t.throws(() => validateComponents(components as Component[]));
});

test('Throw when two components have the same name', (t: Context): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ] as Component[];

  t.throws(() => validateComponents(components));
});

test("Don't throw when all components are valid", (t: Context): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ] as Component[];

  t.notThrows(() => validateComponents(components));
});

test('Throw when one of the prefabs is invalid', (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
    },
  ] as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test("Don't throw when all prefabs are valid", (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
      icon: 'AccordionIcon',
      category: 'Content',
      structure: [],
    },
  ] as Prefab[];

  t.notThrows(() => validatePrefabs(prefabs));
});

test('Throw when one of the prefabs options is invalid', (t: Context): void => {
  const prefabs = ([
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
              invalid: ' ',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown) as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test('Throw when the prefabs option type is not referring to one the correct types', (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'SOMETHING',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test('Throw when two options with the same key are being used', (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'Option 1',
              key: 'sameKey',
              type: 'TEXT',
            },
            {
              value: '',
              label: 'Option 2',
              key: 'sameKEY',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test('Pass when interactions is the empty list', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab]);

  t.pass();
});

test('Throw when a prefab interaction does not define a name', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{} as Interaction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].name" is required at prefab: Prefab
`,
  });
});

test('Throw when a prefab interaction does not define a ref', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{ name: 'interaction 1' } as Interaction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].ref" is required at prefab: Prefab
`,
  });
});

test('Throw when a prefab interaction does not define a type', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        trigger: 'Click',
      } as Interaction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].type" is required at prefab: Prefab
`,
  });
});

test('Throw when a prefab interaction does not define a trigger', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
      } as Interaction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].trigger" is required at prefab: Prefab
`,
  });
});

test('Throw when a prefab interaction type is not Global or Custom', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        trigger: 'Click',
        type: 'Login' as InteractionType,
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].type" must be one of [Global, Custom] at prefab: Prefab
`,
  });
});

test('Throw when a prefab interaction does not define a targetOptionName', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
      } as Interaction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].targetOptionName" is required at prefab: Prefab
`,
  });
});

test('Throw when a prefab interaction does not define a sourceComponent', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{ name: 'interaction 1', ref: {} } as Interaction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].ref.sourceComponent" is required at prefab: Prefab
`,
  });
});

test('Throw when a prefab interaction does not define a targetComponent', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: { sourceComponent: 'component 1' },
      } as Interaction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].ref.targetComponent" is required at prefab: Prefab
`,
  });
});

// test('Throw when a global prefab interaction does not define parameters', (t: Context): void => {
//   const prefab = {
//     category: 'CONTENT',
//     icon: 'TitleIcon',
//     interactions: [
//       {
//         name: 'interaction 1',
//         ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
//         targetOptionName: 'option1',
//         trigger: 'Click',
//         type: 'Global',
//       },
//     ],
//     name: 'Prefab',
//     structure: [],
//   } as Prefab;

//   t.throws(() => validatePrefabs([prefab]), {
//     message: `
// Property: "interactions[0].type" must be one of [Global, Custom] at prefab: Prefab
// `,
//   });
// });

// test('Throw when a custom prefab interaction defines parameters', (t: Context): void => {
//   const prefab = {
//     category: 'CONTENT',
//     icon: 'TitleIcon',
//     interactions: [
//       {
//         name: 'interaction 1',
//         parameters: [],
//         ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
//         targetOptionName: 'option1',
//         trigger: 'Click',
//         type: 'Custom',
//       },
//     ],
//     name: 'Prefab',
//     structure: [],
//   } as Prefab;

//   t.throws(() => validatePrefabs([prefab]), {
//     message: `
// Property: "interactions[0].parameters" is not allowed at prefab: Prefab
// `,
//   });
// });

test('Throw when a global prefab interaction parameter does not define a name', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [{} as InteractionParameter],
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        trigger: 'Click',
        type: 'Global',
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].parameters[0].name" is required at prefab: Prefab
`,
  });
});

test('Throw when a global prefab interaction parameter does not define a parameter', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [{ name: 'option2' } as InteractionParameter],
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        trigger: 'Click',
        type: 'Global',
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].parameters[0].parameter" is required at prefab: Prefab
`,
  });
});

test('Throw when a global prefab interaction parameter does not reference a component', (t: Context): void => {
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
          } as InteractionParameter,
        ],
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        trigger: 'Click',
        type: 'Global',
      },
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].parameters[0].ref.component" is required at prefab: Prefab
`,
  });
});

// /* References */

// test('Throw when a prefab interaction name does not reference an existing interaction', (t: Context): void => {
//   const prefab = {
//     category: 'CONTENT',
//     icon: 'TitleIcon',
//     interactions: [
//       {
//         name: 'interaction 1',
//         parameters: [
//           {
//             name: 'option2',
//             parameter: 'parameter1',
//             ref: { component: 'component 1' },
//           },
//         ],
//         ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
//         targetOptionName: 'option1',
//         trigger: 'Click',
//         type: 'Global',
//       },
//     ],
//     name: 'Prefab',
//     structure: [],
//   } as Prefab;

//   t.throws(() => validatePrefabs([prefab]));
// });

// test('Pass when a prefab interaction name references an existing interaction', (t: Context): void => {
//   const prefab = {
//     category: 'CONTENT',
//     icon: 'TitleIcon',
//     interactions: [
//       {
//         name: 'interaction 1',
//         parameters: [
//           {
//             name: 'option2',
//             parameter: 'parameter1',
//             ref: { component: 'component 1' },
//           },
//         ],
//         ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
//         targetOptionName: 'option1',
//         trigger: 'Click',
//         type: 'Global',
//       },
//     ],
//     name: 'Prefab',
//     structure: [{ name: 'Component 1', ref: { id: 'component 1' } }],
//   } as Prefab;

//   t.throws(() => validatePrefabs([prefab]));
// });

// test('Throw when a prefab interaction does not reference an existing sourceComponent', (t: Context): void => {});

// test('Throw when a prefab interaction does not reference an existing targetComponent', (t: Context): void => {});

// test('Throw when a prefab interaction trigger is not defined in one of the components', (t: Context): void => {});

// test('Throw when a global prefab interaction parameter name does not reference an existing option', (t: Context): void => {});

// test('Throw when a global prefab interaction parameter does not reference a parameter of the interaction function', (t: Context): void => {});

// test('Throw when a global prefab interaction component does not reference an existing component', (t: Context): void => {});

// /* Actions */

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

test('Pass when actions array contains an valid action object', (t: Context): void => {
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
        steps: [
          {
            kind: 'create',
          },
          {
            kind: 'send_mail',
          },
        ],
      } as Action,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab]);

  t.pass();
});

test('Pass when action object does not contain any steps', (t: Context): void => {
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
      } as Action,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab]);

  t.pass();
});

test('Throw when component option has a value key and a ref object with a value key', (t: Context): void => {
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
      } as Action,
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
Build error in prefab HelloWorld: "options[0].ref" is not allowed
 at prefab: Prefab
`,
  });
});

test('Pass when component option has a value key and no ref key', (t: Context): void => {
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

test('Pass when component option has a ref key and no value key', (t: Context): void => {
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
