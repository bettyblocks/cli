import { stripVTControlCharacters } from '__tests__/utils';
import { expect, test } from 'bun:test';

import type { Prefab, PrefabReference, StyleDefinition } from '../../src/types';
import validatePrefabs from '../../src/validations/prefab';
import validateStyles from '../../src/validations/styles';

test('Throw when duplicate style', (): void => {
  const styles: StyleDefinition[] = [
    {
      basis: { color: { type: 'STATIC', value: 'a' } },
      name: 'MyCustomStylo',
      states: [
        {
          content: {
            borderStyle: 'none',
          },
          name: 'disabled',
        },
      ],
      type: 'BUTTON',
    },
    {
      basis: { color: { type: 'STATIC', value: 'b' } },
      name: 'MyCustomStylo',
      states: [
        {
          content: {
            borderStyle: 'none',
          },
          name: 'hover',
        },
      ],
      type: 'BUTTON',
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when empty css content for basis', (): void => {
  const styles: StyleDefinition[] = [
    {
      basis: {},
      name: 'MyCustomStylo',
      states: [],
      type: 'BUTTON',
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when empty css content for state', (): void => {
  const styles: StyleDefinition[] = [
    {
      basis: {
        borderStyle: 'none',
      },
      name: 'MyCustomStylo',
      states: [
        {
          content: {},
          name: 'disabled',
        },
      ],
      type: 'BUTTON',
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when duplicate stateName', (): void => {
  const styles: StyleDefinition[] = [
    {
      basis: {
        borderStyle: 'none',
      },
      name: 'MyCustomStylo',
      states: [
        {
          content: {
            borderStyle: 'none',
          },
          name: 'disabled',
        },
        {
          content: {
            borderColor: {
              type: 'STATIC',
              value: 'Red',
            },
            borderRadius: ['0.25rem'],
            borderStyle: 'none',
            color: {
              type: 'THEME_COLOR',
              value: 'white',
            },
          },
          name: 'disabled',
        },
      ],
      type: 'BUTTON',
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when unsupported css property in basis', (): void => {
  const styles = [
    {
      basis: {
        unsupportedColor: 'yeet',
      },
      name: 'MyCustomStylo',
      states: [],
      type: 'BUTTON',
    },
  ];

  expect(() =>
    validateStyles(styles as StyleDefinition[], ['BUTTON']),
  ).toThrow();
});

test('Throw when unsupported css property in states', (): void => {
  const styles = [
    {
      basis: {
        borderStyle: 'none',
      },
      name: 'MyCustomStylo',
      states: [
        {
          content: {
            unsupportedColor: 'yeet',
          },
          name: 'disabled',
        },
      ],
      type: 'BUTTON',
    },
  ];

  expect(() =>
    validateStyles(styles as StyleDefinition[], ['BUTTON']),
  ).toThrow();
});

test('it throws when the type does not exist as a component', (): void => {
  const styles: StyleDefinition[] = [
    {
      basis: {
        borderStyle: 'none',
      },
      name: 'MyCustomStylo',
      states: [
        {
          content: {
            borderStyle: 'none',
          },
          name: 'disabled',
        },
      ],
      type: 'BUTTON_NEXT_GEN',
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test("Don't throw when all styles are valid", (): void => {
  const styles: StyleDefinition[] = [
    {
      basis: {
        borderStyle: 'none',
      },
      name: 'MyCustomStylo2',
      states: [
        {
          content: {
            borderStyle: 'none',
          },
          name: 'disabled',
        },
      ],
      type: 'BUTTON',
    },
    {
      basis: {
        borderStyle: 'none',
      },
      name: 'MyCustomStylo',
      states: [
        {
          content: {
            borderStyle: 'none',
          },
          name: 'disabled',
        },
      ],
      type: 'BUTTON',
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).not.toThrow();
});

test('it does not throw when a old style reference is defined and no procoder styles are available', (): void => {
  const prefabReference: PrefabReference = {
    descendants: [],
    name: 'Button',
    options: [],
    style: { name: 'Outline' },
    type: 'COMPONENT',
  };

  const prefabs: Prefab[] = [
    {
      category: 'Content',
      icon: 'ButtonIcon',
      name: 'ShinyButton',
      structure: [prefabReference],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('it does throw when a component uses a style but has no styleDefinition by type', (): void => {
  const style: StyleDefinition = {
    basis: {
      borderStyle: 'none',
    },
    name: 'Filled',
    states: [
      {
        content: {
          borderStyle: 'none',
        },
        name: 'disabled',
      },
    ],
    type: 'Magic',
  };
  const prefabReference: PrefabReference = {
    descendants: [],
    name: 'Button',
    options: [],
    style: { name: 'Filled' },
    type: 'COMPONENT',
  };

  const prefabs: Prefab[] = [
    {
      category: 'Content',
      icon: 'ButtonIcon',
      name: 'ShinyButton',
      structure: [prefabReference],
    },
  ];

  const groupedStyles = { Magic: { Filled: style } };

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component Button: "value" failed custom validation because \nBuild error in component style reference to unkown style Button:Filled \n\n at prefab: ShinyButton\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs, styles: groupedStyles });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but has no styleDefinition by name', (): void => {
  const style: StyleDefinition = {
    basis: {
      borderStyle: 'none',
    },
    name: 'yeep',
    states: [
      {
        content: {
          borderStyle: 'none',
        },
        name: 'disabled',
      },
    ],
    type: 'Button',
  };
  const prefabReference: PrefabReference = {
    descendants: [],
    name: 'Button',
    options: [],
    style: { name: 'Filled' },
    type: 'COMPONENT',
  };

  const prefabs: Prefab[] = [
    {
      category: 'Content',
      icon: 'ButtonIcon',
      name: 'ShinyButton',
      structure: [prefabReference],
    },
  ];

  const groupedStyles = { Button: { yeep: style } };

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component Button: "value" failed custom validation because \nBuild error in component style reference to unkown style Button:Filled \n\n at prefab: ShinyButton\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs, styles: groupedStyles });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for basis', (): void => {
  const style: StyleDefinition = {
    basis: {
      borderStyle: 'none',
    },
    name: 'Filled',
    states: [
      {
        content: {
          borderStyle: 'none',
        },
        name: 'disabled',
      },
    ],
    type: 'Button',
  };
  const prefabReference: PrefabReference = {
    descendants: [],
    name: 'Button',
    options: [],
    style: {
      name: 'Filled',
      overwrite: [{ content: { borderWidth: ['1rem'] }, name: 'basis' }],
    },
    type: 'COMPONENT',
  };

  const prefabs: Prefab[] = [
    {
      category: 'Content',
      icon: 'ButtonIcon',
      name: 'ShinyButton',
      structure: [prefabReference],
    },
  ];

  const groupedStyles = { Button: { Filled: style } };

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component Button: "value" failed custom validation because \nBuild error in component style reference invalid overwrite for Button:Filled where basis overwrites a non existing css property borderWidth \n\n at prefab: ShinyButton\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs, styles: groupedStyles });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for state key object', (): void => {
  const style: StyleDefinition = {
    basis: {
      borderStyle: 'none',
    },
    name: 'Filled',
    states: [
      {
        content: {
          borderStyle: 'none',
        },
        name: 'disabled',
      },
    ],
    type: 'Button',
  };
  const prefabReference: PrefabReference = {
    descendants: [],
    name: 'Button',
    options: [],
    style: {
      name: 'Filled',
      overwrite: [{ content: { borderWidth: ['1rem'] }, name: 'disabled' }],
    },
    type: 'COMPONENT',
  };

  const prefabs: Prefab[] = [
    {
      category: 'Content',
      icon: 'ButtonIcon',
      name: 'ShinyButton',
      structure: [prefabReference],
    },
  ];

  const groupedStyles = { Button: { Filled: style } };

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component Button: "value" failed custom validation because \nBuild error in component style reference invalid overwrite for Button:Filled where disabled overwrites a non existing css property borderWidth \n\n at prefab: ShinyButton\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs, styles: groupedStyles });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for state key', (): void => {
  const style: StyleDefinition = {
    basis: {
      borderStyle: 'none',
    },
    name: 'Filled',
    states: [
      {
        content: {
          borderStyle: 'none',
        },
        name: 'disabled',
      },
    ],
    type: 'Button',
  };
  const prefabReference: PrefabReference = {
    descendants: [],
    name: 'Button',
    options: [],
    style: {
      name: 'Filled',
      overwrite: [{ content: { borderWidth: ['1rem'] }, name: 'hover' }],
    },
    type: 'COMPONENT',
  };

  const prefabs: Prefab[] = [
    {
      category: 'Content',
      icon: 'ButtonIcon',
      name: 'ShinyButton',
      structure: [prefabReference],
    },
  ];

  const groupedStyles = { Button: { Filled: style } };

  const expectedMessage =
    '\nProperty: "structure[0]" failed custom validation because \nBuild error in component Button: "value" failed custom validation because \nBuild error in component style reference invalid overwrite for Button where hover does not exist in style Filled \n\n at prefab: ShinyButton\n';

  let actualError: Error | undefined;
  try {
    validatePrefabs({ prefabs, styles: groupedStyles });
  } catch (error) {
    actualError = error as Error;
  }

  expect(actualError).toBeDefined();
  expect(stripVTControlCharacters(actualError?.message)).toBe(expectedMessage);
});
