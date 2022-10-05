import test, { ExecutionContext } from 'ava';

import { Prefab, PrefabReference, StyleDefinition } from '../../src/types';
import validateStyles from '../../src/validations/styles';
import validatePrefabs from '../../src/validations/prefab';

type Context = ExecutionContext<unknown>;

test('Throw when duplicate style', (t: Context): void => {
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

  t.throws(() => validateStyles(styles, ['BUTTON']));
});

test('Throw when empty css content for basis', (t: Context): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {},
      states: [],
    },
  ];

  t.throws(() => validateStyles(styles, ['BUTTON']));
});

test('Throw when empty css content for state', (t: Context): void => {
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

  t.throws(() => validateStyles(styles, ['BUTTON']));
});

test('Throw when duplicate stateName', (t: Context): void => {
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

  t.throws(() => validateStyles(styles, ['BUTTON']));
});

test('Throw when unsupported css property in basis', (t: Context): void => {
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

  t.throws(() => validateStyles(styles as StyleDefinition[], ['BUTTON']));
});

test('Throw when unsupported css property in states', (t: Context): void => {
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

  t.throws(() => validateStyles(styles as StyleDefinition[], ['BUTTON']));
});

test('it throws when the type does not exist as a component', (t: Context): void => {
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

  t.throws(() => validateStyles(styles, ['BUTTON']));
});

test("Don't throw when all styles are valid", (t: Context): void => {
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

  t.notThrows(() => validateStyles(styles, ['BUTTON']));
});

test('it does not throw when a old style reference is defined and no procoder styles are available', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('it does throw when a component uses a style but has no styleDefinition by type', (t: Context): void => {
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

  const expectedMessage = "\nProperty: \"structure[0]\" failed custom validation because \nBuild error in component Button: \"value\" failed custom validation because \nBuild error in component style reference to unkown style Button:Filled \n\n at prefab: ShinyButton\n";

  const error  = t.throws(() => validatePrefabs(prefabs, groupedStyles));
  t.is(error.message, expectedMessage);
});

test('it does throw when a component uses a style but has no styleDefinition by name', (t: Context): void => {
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

  const expectedMessage = "\nProperty: \"structure[0]\" failed custom validation because \nBuild error in component Button: \"value\" failed custom validation because \nBuild error in component style reference to unkown style Button:Filled \n\n at prefab: ShinyButton\n";

  const error  = t.throws(() => validatePrefabs(prefabs, groupedStyles));
  t.is(error.message, expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for basis', (t: Context): void => {
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

  const error = t.throws(() => validatePrefabs(prefabs, groupedStyles));
  t.is(error.message, expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for state key object', (t: Context): void => {
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

  const error = t.throws(() => validatePrefabs(prefabs, groupedStyles));
  t.is(error.message, expectedMessage);
});

test('it does throw when a component uses a style but the overwrite does not match the StyleDefinition for state key', (t: Context): void => {
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

  const error = t.throws(() => validatePrefabs(prefabs, groupedStyles));
  t.is(error.message, expectedMessage);
});