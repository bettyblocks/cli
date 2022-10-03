import test, { ExecutionContext } from 'ava';

import { StyleDefinition } from '../../src/types';
import validateStyles from '../../src/validations/styles';

type Context = ExecutionContext<unknown>;

test('Throw when duplicate style', (t: Context): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {color: {type: "STATIC", value: "a"}},
      states: [
        {
          name: 'disabled',
          cssObject: {
            borderStyle: 'none',
          }
        },
      ],
    },
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {color: {type: "STATIC", value: "b"}},
      states: [
        {
          name: 'hover',
          cssObject: {
            borderStyle: 'none',
          }
        },
      ],
    }
  ];

  t.throws(() => validateStyles(styles));
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

  t.throws(() => validateStyles(styles));
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
          cssObject: {}
        },
      ],
    },
  ];

  t.throws(() => validateStyles(styles));
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
          cssObject: {
            borderStyle: 'none',
          }
        },
        {
          name: 'disabled',
          cssObject: {
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

  t.throws(() => validateStyles(styles));
});

test('Throw when unsupported css property in basis', (t: Context): void => {
  const styles = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      basis: {
        unsupportedColor: "yeet",
      },
      states: [],
    },
  ];

  t.throws(() => validateStyles(styles as StyleDefinition[]));
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
          cssObject: {
            unsupportedColor: "yeet",
          },
        }
      ],
    },
  ];

  t.throws(() => validateStyles(styles as StyleDefinition[]));
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
          cssObject: {
            borderStyle: 'none',
          }
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
          name: 'root',
          cssObject: {
            borderStyle: 'none',
          }
        },
      ],
    },
  ];

  t.notThrows(() => validateStyles(styles));
});
