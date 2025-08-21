import { expect, test } from 'bun:test';

import { buildReferenceStyle, buildStyle } from '../../src/components-build';
import type {
  BuildStyle,
  BuildStyleDefinition,
  StyleDefinition,
  StyleDefinitionContentOverwrites,
} from '../../src/types';

test('it build a styleReference for the componentPrefab backwards compatible', (): void => {
  const style = {
    name: 'Filled',
    overwrite: {
      backgroundColor: { type: 'STATIC', value: 'Red' },
    },
  };

  expect(buildReferenceStyle(style)).toEqual(style);
});

test('it build a styleReference for the componentPrefab for states', (): void => {
  const overwrite: StyleDefinitionContentOverwrites[] = [
    {
      content: {
        backgroundColor: { type: 'STATIC', value: 'Red' },
      },
      name: 'basis',
    },
    {
      content: {
        backgroundColor: { type: 'STATIC', value: 'Blue' },
      },
      name: 'hover',
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

  expect(buildReferenceStyle(style)).toEqual(expected);
});

test('it build a style ', (): void => {
  const style: StyleDefinition = {
    basis: { backgroundColor: { type: 'STATIC', value: 'Red' } },
    name: 'Filled',
    states: [
      {
        content: {
          backgroundColor: { type: 'STATIC', value: 'Blue' },
        },
        name: 'hover',
      },
    ],
    type: 'Button',
  };

  const expected: BuildStyleDefinition = {
    content: {
      basis: { backgroundColor: { type: 'STATIC', value: 'Red' } },
      hover: { backgroundColor: { type: 'STATIC', value: 'Blue' } },
    },
    name: 'Filled',
    type: 'Button',
  };

  expect(buildStyle(style)).toEqual(expected);
});
