/* eslint-disable @typescript-eslint/no-empty-function */
import test, { ExecutionContext } from 'ava';
import fs from 'fs';

import toCompatibility from '../src/interactions/compatibility';
import { InteractionOptionType } from '../src/types';

type Context = ExecutionContext<unknown>;

test('extract compatibility for: () => boolean', (t: Context): void => {
  const compatibility = toCompatibility('__tests__/assets/boolean.ts');

  t.deepEqual(compatibility, {
    name: 'yes',
    parameters: {},
    function: 'function yes(): boolean { return true; }',
    type: InteractionOptionType.Boolean,
  });
});

test('extract compatibility for: () => void', (t: Context): void => {
  const compatibility = toCompatibility('__tests__/assets/void.ts');

  console.log(compatibility);

  t.deepEqual(compatibility, {
    function: 'function noop(): void { return; }',
    name: 'noop',
    parameters: {},
    type: InteractionOptionType.Void,
  });
});

test('extract compatibility for: ({ event, price, quantity }: { event: Event, price: number, quantity: number }) => number', (t: Context): void => {
  const compatibility = toCompatibility('__tests__/assets/typical.ts');

  t.deepEqual(compatibility, {
    function: `function subtotal({ event, price, quantity }) { 
      return price * quantity;
    }`,
    name: 'subtotal',
    parameters: {
      price: InteractionOptionType.Number,
      quantity: InteractionOptionType.Number,
    },
    type: InteractionOptionType.Number,
  });
});

test('fail extraction when passing no interaction', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/empty.ts'), {
    name: 'RangeError',
    message: 'file does not contain an interaction',
  });
});

test('fail when passing an arrow function instead of a function', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/arrow.ts'), {
    name: 'TypeError',
    message: `
expected expression of the kind
  function interaction({ event, argument }: { event: Event, argument: ArgumentType }): ReturnType {
    // body
  }
`,
  });
});

test('fail extraction when passing incompatible type for: subtotal({ event, price }: { event: Event, price: PriceType }): number => number', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/incompatibleType.ts'), {
    name: 'TypeError',
    message: 'unsupported type: PriceType',
  });
});

test('fail extraction with multiple function statements', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/multiple.ts'), {
    name: 'RangeError',
    message: 'file contains multiple statements',
  });
});

test('fail extraction without function statement', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/empty.ts'), {
    name: 'RangeError',
    message: 'file does not contain an interaction',
  });
});
