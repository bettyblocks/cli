import { expect, test } from 'bun:test';

import toCompatibility from '../src/interactions/compatibility';
import { InteractionOptionType } from '../src/types';

test('extract compatibility for: () => boolean', (): void => {
  const compatibility = toCompatibility('__tests__/assets/yes.ts');

  expect(compatibility).toEqual({
    function: `function yes() {
    return true;
}
`,
    name: 'yes',
    parameters: {},
    type: InteractionOptionType.Boolean,
  });
});

test('extract compatibility for: () => void', (): void => {
  const compatibility = toCompatibility('__tests__/assets/noop.ts');

  expect(compatibility).toEqual({
    function: `function noop() {
    /** noop */
}
`,
    name: 'noop',
    parameters: {},
    type: InteractionOptionType.Void,
  });
});

test('extract compatibility for: ({ event, price, quantity }: { event: Event, price: number, quantity: number }) => number', (): void => {
  const compatibility = toCompatibility('__tests__/assets/subtotal.ts');

  expect(compatibility).toEqual({
    function: `function subtotal(_a) {
    var event = _a.event, price = _a.price, quantity = _a.quantity;
    return price * quantity;
}
`,
    name: 'subtotal',
    parameters: {
      event: InteractionOptionType.Event,
      price: InteractionOptionType.Number,
      quantity: InteractionOptionType.Number,
    },
    type: InteractionOptionType.Number,
  });
});

test('add compatibility for unknown type', (): void => {
  const compatibility = toCompatibility('__tests__/assets/unknownEvent.ts');

  expect(compatibility).toEqual({
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

test('fail extraction when passing no interaction', (): void => {
  expect(() => toCompatibility('__tests__/assets/empty.ts')).toThrow(
    expect.objectContaining({
      message: `
    expected expression of the kind
      function empty({ event, argument }: { event: Event, argument: ArgumentType }): ReturnType {
        // body
      }
    `,
      name: 'RangeError',
    }),
  );
});

test('fail when passing an arrow function instead of a function', (): void => {
  expect(() => toCompatibility('__tests__/assets/arrow.ts')).toThrow(
    expect.objectContaining({
      message: `
    expected expression of the kind
      function arrow({ event, argument }: { event: Event, argument: ArgumentType }): ReturnType {
        // body
      }
    `,
      name: 'RangeError',
    }),
  );
});

test('fail extraction when passing incompatible type for: subtotal({ event, price }: { event: Event, price: PriceType }): number => number', (): void => {
  expect(() => toCompatibility('__tests__/assets/incompatibleType.ts')).toThrow(
    expect.objectContaining({
      message: 'unsupported type for: price',
      name: 'TypeError',
    }),
  );
});

test('fail extraction with multiple function statements', (): void => {
  expect(() => toCompatibility('__tests__/assets/multiple.ts')).toThrow(
    expect.objectContaining({
      message: 'file contains multiple statements',
      name: 'RangeError',
    }),
  );
});
