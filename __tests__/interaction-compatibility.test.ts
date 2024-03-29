/* eslint-disable @typescript-eslint/no-empty-function */
import test, { ExecutionContext } from 'ava';

import toCompatibility from '../src/interactions/compatibility';
import { InteractionOptionType } from '../src/types';

type Context = ExecutionContext<unknown>;

test('extract compatibility for: () => boolean', (t: Context): void => {
  const compatibility = toCompatibility('__tests__/assets/yes.ts');

  t.deepEqual(compatibility, {
    function: `function yes() {
    return true;
}
`,
    name: 'yes',
    parameters: {},
    type: InteractionOptionType.Boolean,
  });
});

test('extract compatibility for: () => void', (t: Context): void => {
  const compatibility = toCompatibility('__tests__/assets/noop.ts');

  t.deepEqual(compatibility, {
    function: `function noop() {
    /** noop */
}
`,
    name: 'noop',
    parameters: {},
    type: InteractionOptionType.Void,
  });
});

test('extract compatibility for: ({ event, price, quantity }: { event: Event, price: number, quantity: number }) => number', (t: Context): void => {
  const compatibility = toCompatibility('__tests__/assets/subtotal.ts');

  t.deepEqual(compatibility, {
    function: `function subtotal(_a) {
    var event = _a.event, price = _a.price, quantity = _a.quantity;
    return price * quantity;
}
`,
    name: 'subtotal',
    parameters: {
      price: InteractionOptionType.Number,
      quantity: InteractionOptionType.Number,
      event: InteractionOptionType.Event,
    },
    type: InteractionOptionType.Number,
  });
});

test('add compatibility for unknown type', (t: Context): void => {
  const compatibility = toCompatibility('__tests__/assets/unknownEvent.ts');

  t.deepEqual(compatibility, {
    function: `function unknownEvent(_a) {
    var event = _a.event;
    return 1;
}
`,
    name: 'unknownEvent',
    parameters: {
      event: InteractionOptionType.Unknown,
    },
    type: InteractionOptionType.Number,
  });
});

test('fail extraction when passing no interaction', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/empty.ts'), {
    name: 'RangeError',
    message: `
    expected expression of the kind
      function empty({ event, argument }: { event: Event, argument: ArgumentType }): ReturnType {
        // body
      }
    `,
  });
});

test('fail when passing an arrow function instead of a function', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/arrow.ts'), {
    name: 'RangeError',
    message: `
    expected expression of the kind
      function arrow({ event, argument }: { event: Event, argument: ArgumentType }): ReturnType {
        // body
      }
    `,
  });
});

test('fail extraction when passing incompatible type for: subtotal({ event, price }: { event: Event, price: PriceType }): number => number', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/incompatibleType.ts'), {
    name: 'TypeError',
    message: 'unsupported type for: price',
  });
});

test('fail extraction with multiple function statements', (t: Context): void => {
  t.throws(() => toCompatibility('__tests__/assets/multiple.ts'), {
    name: 'RangeError',
    message: 'file contains multiple statements',
  });
});
