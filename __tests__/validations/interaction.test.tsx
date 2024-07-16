import {
  InteractionType,
  Prefab,
  PrefabInteraction,
  PrefabInteractionParameter,
} from '../../src/types';
import validatePrefabs from '../../src/validations/prefab';

test('Pass without interactions array', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Pass when interactions is the empty list', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  validatePrefabs([prefab], {});
});

test('Throw when a prefab interaction does not define a name', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{} as PrefabInteraction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].name" is required at prefab: Prefab',
  );
});

test('Throw when a prefab interaction does not define a ref', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{ name: 'interaction 1' } as PrefabInteraction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].ref" is required at prefab: Prefab',
  );
});

test('Throw when a prefab interaction does not define a type', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].type" is required at prefab: Prefab',
  );
});

test('Throw when a prefab interaction does not define a sourceEvent', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].sourceEvent" is required at prefab: Prefab',
  );
});

test('Throw when a prefab interaction type is not Global or Custom', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].type" must be one of [Global, Custom] at prefab: Prefab',
  );
});

test('Throw when a prefab interaction does not define a sourceComponentId', () => {
  const prefab = {
    category: 'CONTENT',
    icon: 'TitleIcon',
    interactions: [{ name: 'interaction 1', ref: {} } as PrefabInteraction],
    name: 'Prefab',
    structure: [],
  } as Prefab;

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].ref.sourceComponentId" is required at prefab: Prefab',
  );
});

test('Throw when a global prefab interaction does not define parameters', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].parameters" is required at prefab: Prefab',
  );
});

test('Throw when a custom prefab interaction defines parameters', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].parameters" is not allowed at prefab: Prefab',
  );
});

test('Throw when a global prefab interaction parameter does not define a parameter', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].parameters[0].parameter" is required at prefab: Prefab',
  );
});

test('Throw when a global prefab interaction parameter does not define a name', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].parameters[0].name" is required at prefab: Prefab',
  );
});

test('Throw when a global prefab interaction parameter does not reference a component', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].parameters[0].ref" is required at prefab: Prefab',
  );
});

test('Throw when a global prefab interaction parameter does not define a component id', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].parameters[0].ref.componentId" is required at prefab: Prefab',
  );
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
//         ref: { sourceComponentId: 'component 1', targetComponentId: 'component 2' },
//         targetOptionName: 'option1',
//         sourceEvent: 'Click',
//         type: 'Global',
//       },
//     ],
//     name: 'Prefab',
//     structure: [],
//   } as Prefab;

//   t.throws(() => validatePrefabs([prefab], {}));
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
//         ref: { sourceComponentId: 'component 1', targetComponentId: 'component 2' },
//         targetOptionName: 'option1',
//         sourceEvent: 'Click',
//         type: 'Global',
//       },
//     ],
//     name: 'Prefab',
//     structure: [{ name: 'Component 1', ref: { id: 'component 1' } }],
//   } as Prefab;

//   t.throws(() => validatePrefabs([prefab], {}));
// });

// test('Throw when a prefab interaction does not reference an existing sourceComponentId', (t: Context): void => {});

// test('Throw when a prefab interaction does not reference an existing targetComponentId', (t: Context): void => {});

// test('Throw when a prefab interaction sourceEvent is not defined in one of the components', (t: Context): void => {});

// test('Throw when a global prefab interaction parameter name does not reference an existing option', (t: Context): void => {});

// test('Throw when a global prefab interaction parameter does not reference a parameter of the interaction function', (t: Context): void => {});

// test('Throw when a global prefab interaction component does not reference an existing component', (t: Context): void => {});

test('Throw when a custom prefab interaction defines targetOptionName', () => {
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

  expect(() => validatePrefabs([prefab], {})).toThrowError(
    'Property: "interactions[0].targetOptionName" is not allowed at prefab: Prefab',
  );
});
