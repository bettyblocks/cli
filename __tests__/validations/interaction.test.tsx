import test, { ExecutionContext } from 'ava';

import {
  InteractionType,
  Prefab,
  PrefabInteraction,
  PrefabInteractionParameter,
} from '../../src/types';
import validatePrefabs from '../../src/validations/prefab';

type Context = ExecutionContext<unknown>;

test('Pass without interactions array', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab]);

  t.pass();
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
    interactions: [{} as PrefabInteraction],
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
    interactions: [{ name: 'interaction 1' } as PrefabInteraction],
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
        sourceEvent: 'Click',
      } as PrefabInteraction,
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

test('Throw when a prefab interaction does not define a sourceEvent', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
      } as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].sourceEvent" is required at prefab: Prefab
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
        sourceEvent: 'Click',
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
      } as PrefabInteraction,
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
    interactions: [{ name: 'interaction 1', ref: {} } as PrefabInteraction],
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
      } as PrefabInteraction,
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

test('Throw when a global prefab interaction does not define parameters', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      ({
        name: 'interaction 1',
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Global',
      } as unknown) as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].parameters" is required at prefab: Prefab
`,
  });
});

test('Throw when a custom prefab interaction defines parameters', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      ({
        name: 'interaction 1',
        parameters: [],
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
        type: 'Custom',
      } as unknown) as PrefabInteraction,
    ],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  t.throws(() => validatePrefabs([prefab]), {
    message: `
Property: "interactions[0].parameters" is not allowed at prefab: Prefab
`,
  });
});

test('Throw when a global prefab interaction parameter does not define a name', (t: Context): void => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [
      {
        name: 'interaction 1',
        parameters: [{} as PrefabInteractionParameter],
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
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
        parameters: [{ name: 'option2' } as PrefabInteractionParameter],
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
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
          } as PrefabInteractionParameter,
        ],
        ref: { sourceComponent: 'component 1', targetComponent: 'component 2' },
        targetOptionName: 'option1',
        sourceEvent: 'Click',
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
//         sourceEvent: 'Click',
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
//         sourceEvent: 'Click',
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

// test('Throw when a prefab interaction sourceEvent is not defined in one of the components', (t: Context): void => {});

// test('Throw when a global prefab interaction parameter name does not reference an existing option', (t: Context): void => {});

// test('Throw when a global prefab interaction parameter does not reference a parameter of the interaction function', (t: Context): void => {});

// test('Throw when a global prefab interaction component does not reference an existing component', (t: Context): void => {});

// /* Actions */
