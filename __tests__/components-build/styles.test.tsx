import { test, expect } from 'bun:test';

import { buildReferenceStyle, buildStyle } from '../../src/components-build';
import {
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
      name: 'basis',
      content: {
        backgroundColor: { type: 'STATIC', value: 'Red' },
      },
    },
    {
      name: 'hover',
      content: {
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

  expect(buildReferenceStyle(style)).toEqual(expected);
});

test('it build a style ', (): void => {
  const style: StyleDefinition = {
    name: 'Filled',
    type: 'Button',
    basis: { backgroundColor: { type: 'STATIC', value: 'Red' } },
    states: [
      {
        name: 'hover',
        content: {
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

  expect(buildStyle(style)).toEqual(expected);
});
