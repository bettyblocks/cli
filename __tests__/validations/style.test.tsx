import test, { ExecutionContext } from 'ava';

import { Component, StyleDefinition } from '../../src/types';
import validateComponents from '../../src/validations/component';
import validateStyles from '../../src/validations/styles';

type Context = ExecutionContext<unknown>;

test('Throw when duplicate style', (t: Context): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      content: [
        {
          className: 'root',
          styleObject: {
            borderStyle: 'none',
          }
        },
      ],
    },
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      content: [
        {
          className: 'root',
          styleObject: {
            borderStyle: 'none',
          }
        },
      ],
    }
  ];

  t.throws(() => validateStyles(styles));
});

test('Throw when empty content', (t: Context): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      content: [],
    },
  ];

  t.throws(() => validateStyles(styles));
});

test('Throw when duplicate className', (t: Context): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      content: [
        {
          className: 'root',
          styleObject: {
            borderStyle: 'none',
          }
        },
        {
          className: 'root',
          styleObject: {
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

test('Throw when empty styleObject', (t: Context): void => {
  const styles: StyleDefinition[] = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      content: [
        {
          className: 'root',
          styleObject: {}
        },
      ],
    },
  ];

  t.throws(() => validateStyles(styles));
});

test('Throw when unsupported styleObject property', (t: Context): void => {
  const styles = [
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      content: [
        {
          className: 'root',
          styleObject: {
            unsupportedColor: "yeet",
          }
        },
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
      content: [
        {
          className: 'root',
          styleObject: {
            borderStyle: 'none',
          }
        },
      ],
    },
    {
      type: 'BUTTON',
      name: 'MyCustomStylo',
      content: [
        {
          className: 'root',
          styleObject: {
            borderStyle: 'none',
          }
        },
      ],
    },
  ];

  t.notThrows(() => validateStyles(styles));
});
