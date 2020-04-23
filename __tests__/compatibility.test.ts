/* eslint-disable @typescript-eslint/no-empty-function */
import test, { ExecutionContext } from 'ava';

import toCompatibility from '../src/interactions/compatibility';

type Context = ExecutionContext<unknown>;

// TODO: test

test('extract compatibility for: () => void', (t: Context): void => {
  const code = 'const f = (): void => {};';

  console.log(code);
  const compatibility = toCompatibility(code);
  console.log(compatibility);

  t.is(compatibility, '{}');
});
