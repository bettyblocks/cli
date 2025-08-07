import { test, expect } from 'bun:test';
// @ts-ignore - stripVTControlCharacters exists in Node 16.17+ but types may not be updated
import { stripVTControlCharacters } from 'util';

import { Prefab, PrefabReference, StyleDefinition } from '../../src/types';
import validateStyles from '../../src/validations/styles';
import validatePrefabs from '../../src/validations/prefab';

test('Throw when duplicate style', (): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: { color: { type: 'STATIC', value: 'a' } },
      states: [
        {
          name: 'disabled',
          content: {
            borderStyle: 'none',
          },
        },
      ],
    },
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: { color: { type: 'STATIC', value: 'b' } },
      states: [
        {
          name: 'hover',
          content: {
            borderStyle: 'none',
          },
        },
      ],
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when empty css content for basis', (): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {},
      states: [],
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when empty css content for state', (): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {
        borderStyle: 'none',
      },
      states: [
        {
          name: 'disabled',
          content: {},
        },
      ],
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when duplicate stateName', (): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {
        borderStyle: 'none',
      },
      states: [
        {
          name: 'disabled',
          content: {
            borderStyle: 'none',
          },
        },
        {
          name: 'disabled',
          content: {
            borderRadius: ['0.25rem'],
            borderStyle: 'none',
            color: {
              type: 'THEME_COLOR',
              value: 'white',
            },
            borderColor: {
              type: 'STATIC',
              value: 'Red',
            },
          },
        },
      ],
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test('Throw when unsupported css property in basis', (): void => {
  const styles = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {
        unsupportedColor: 'yeet',
      },
      states: [],
    },
  ];

  expect(() =>
    validateStyles(styles as StyleDefinition[], ['BUTTON']),
  ).toThrow();
});

test('Throw when unsupported css property in states', (): void => {
  const styles = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {
        borderStyle: 'none',
      },
      states: [
        {
          name: 'disabled',
          content: {
            unsupportedColor: 'yeet',
          },
        },
      ],
    },
  ];

  expect(() =>
    validateStyles(styles as StyleDefinition[], ['BUTTON']),
  ).toThrow();
});

test('it throws when the type does not exist as a component', (): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON_NEXT_GEN',
      name: 'MyCustomStylo',
      basis: {
        borderStyle: 'none',
      },
      states: [
        {
          name: 'disabled',
          content: {
            borderStyle: 'none',
          },
        },
      ],
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).toThrow();
});

test("Don't throw when all styles are valid", (): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo2',
      basis: {
        borderStyle: 'none',
      },
      states: [
        {
          name: 'disabled',
          content: {
            borderStyle: 'none',
          },
        },
      ],
    },
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {
        borderStyle: 'none',
      },
      states: [
        {
          name: 'disabled',
          content: {
            borderStyle: 'none',
          },
        },
      ],
    },
  ];

  expect(() => validateStyles(styles, ['BUTTON'])).not.toThrow();
});

test('it does not throw when a old style reference is defined and no procoder styles are available', (): void => {
  const prefabReference: PrefabReference = {
    type: 'COMPONENT',
    name: 'Button',
    descendants: [],
    options: [],
    style: { name: 'Outline' },
  };

  const prefabs: Prefab[] = [
    {
      name: 'ShinyButton',
      icon: 'ButtonIcon',
      category: 'Content',
      structure: [prefabReference],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('it does throw when a component uses a style but has no styleDefinition by type', (): void => {
  const style: StyleDefinition = {
    type: 'Magic',
    name: 'Filled',
    basis: {
      borderStyle: 'none',
    },
    states: [
      {
        name: 'disabled',
        content: {
          borderStyle: 'none',
        },
      },
    ],
  };
  const prefabReference: PrefabReference = {
    type: 'COMPONENT',
    name: 'Button',
    descendants: [],
    options: [],
    style: { name: 'Filled' },
  };

  const prefabs: Prefab[] = [
    {
      name: 'ShinyButton',
      icon: 'ButtonIcon',
      category: 'Content',
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
  expect(stripVTControlCharacters(actualError!.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but has no styleDefinition by name', (): void => {
  const style: StyleDefinition = {
    type: 'Button',
    name: 'yeep',
    basis: {
      borderStyle: 'none',
    },
    states: [
      {
        name: 'disabled',
        content: {
          borderStyle: 'none',
        },
      },
    ],
  };
  const prefabReference: PrefabReference = {
    type: 'COMPONENT',
    name: 'Button',
    descendants: [],
    options: [],
    style: { name: 'Filled' },
  };

  const prefabs: Prefab[] = [
    {
      name: 'ShinyButton',
      icon: 'ButtonIcon',
      category: 'Content',
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
  expect(stripVTControlCharacters(actualError!.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for basis', (): void => {
  const style: StyleDefinition = {
    type: 'Button',
    name: 'Filled',
    basis: {
      borderStyle: 'none',
    },
    states: [
      {
        name: 'disabled',
        content: {
          borderStyle: 'none',
        },
      },
    ],
  };
  const prefabReference: PrefabReference = {
    type: 'COMPONENT',
    name: 'Button',
    descendants: [],
    options: [],
    style: {
      name: 'Filled',
      overwrite: [{ name: 'basis', content: { borderWidth: ['1rem'] } }],
    },
  };

  const prefabs: Prefab[] = [
    {
      name: 'ShinyButton',
      icon: 'ButtonIcon',
      category: 'Content',
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
  expect(stripVTControlCharacters(actualError!.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for state key object', (): void => {
  const style: StyleDefinition = {
    type: 'Button',
    name: 'Filled',
    basis: {
      borderStyle: 'none',
    },
    states: [
      {
        name: 'disabled',
        content: {
          borderStyle: 'none',
        },
      },
    ],
  };
  const prefabReference: PrefabReference = {
    type: 'COMPONENT',
    name: 'Button',
    descendants: [],
    options: [],
    style: {
      name: 'Filled',
      overwrite: [{ name: 'disabled', content: { borderWidth: ['1rem'] } }],
    },
  };

  const prefabs: Prefab[] = [
    {
      name: 'ShinyButton',
      icon: 'ButtonIcon',
      category: 'Content',
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
  expect(stripVTControlCharacters(actualError!.message)).toBe(expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for state key', (): void => {
  const style: StyleDefinition = {
    type: 'Button',
    name: 'Filled',
    basis: {
      borderStyle: 'none',
    },
    states: [
      {
        name: 'disabled',
        content: {
          borderStyle: 'none',
        },
      },
    ],
  };
  const prefabReference: PrefabReference = {
    type: 'COMPONENT',
    name: 'Button',
    descendants: [],
    options: [],
    style: {
      name: 'Filled',
      overwrite: [{ name: 'hover', content: { borderWidth: ['1rem'] } }],
    },
  };

  const prefabs: Prefab[] = [
    {
      name: 'ShinyButton',
      icon: 'ButtonIcon',
      category: 'Content',
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
  expect(stripVTControlCharacters(actualError!.message)).toBe(expectedMessage);
});
