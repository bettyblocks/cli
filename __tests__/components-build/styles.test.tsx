import test, { ExecutionContext } from 'ava';

type Context = ExecutionContext<unknown>;

import { buildReferenceStyle, buildStyle } from '../../src/components-build';
import {
  BuildStyle,
  BuildStyleDefinition,
  StyleDefinition,
  StyleDefinitionContentOverwrites,
} from '../../src/types';

test('it build a styleReference for the componentPrefab backwards compatible', (t: Context): void => {
  const style = {
    name: 'Filled',
    overwrite: {
      backgroundColor: { type: 'STATIC', value: 'Red' },
    },
  };

  t.deepEqual(buildReferenceStyle(style), style);
});

test('it build a styleReference for the componentPrefab for states', (t: Context): void => {
  const overwrite: StyleDefinitionContentOverwrites[] = [
    {
      name: 'basis',
      cssObject: {
        backgroundColor: { type: 'STATIC', value: 'Red' },
      },
    },
    {
      name: 'hover',
      cssObject: {
        backgroundColor: { type: 'STATIC', value: 'Blue' },
      },
    },
  ];

  const style = {
    name: 'Filled',
    overwrite,
  };

  const expected: BuildStyle = {
    name: 'Filled',
    overwrite: {
      basis: { backgroundColor: { type: 'STATIC', value: 'Red' } },
      hover: { backgroundColor: { type: 'STATIC', value: 'Blue' } },
    },
  };

  t.deepEqual(buildReferenceStyle(style), expected);
});

test('it build a style ', (t: Context): void => {
  const style: StyleDefinition = {
    name: 'Filled',
    type: 'Button',
    basis: { backgroundColor: { type: 'STATIC', value: 'Red' } },
    states: [
      {
        name: 'hover',
        cssObject: {
          backgroundColor: { type: 'STATIC', value: 'Blue' },
        },
      },
    ],
  };

  const expected: BuildStyleDefinition = {
    name: 'Filled',
    type: 'Button',
    content: {
      basis: { backgroundColor: { type: 'STATIC', value: 'Red' } },
      hover: { backgroundColor: { type: 'STATIC', value: 'Blue' } },
    },
  };

  t.deepEqual(buildStyle(style), expected);
});
