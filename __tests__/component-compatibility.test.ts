/* eslint-disable @typescript-eslint/no-empty-function */
import test, { ExecutionContext } from 'ava';

import toCompatibility from '../src/components/compatibility';

type Context = ExecutionContext<unknown>;

test('extract compatibility for simple button with custom trigger and function', (t: Context): void => {
  const code = `
  (() => ({
    name: 'Button',
    type: 'BUTTON',
    icon: 'ButtonIcon',
    orientation: 'VERTICAL',
    allowedTypes: [],
    jsx: (() => {
      const handleClick = event => {
        B.triggerEvent('CustomTrigger', event);
      };
      useEffect(() => {
        B.defineFunction('CustomFunction', event => {
          console.log(event);
        });
      }, []);
      return (
        <button>
          Knopje
        </button>
      );
    })(),
    styles: () => () => ({}),
  }))();
  `;

  const compatibility = toCompatibility(code);

  t.deepEqual(compatibility, {
    triggers: ['CustomTrigger'],
    functions: ['CustomFunction'],
  });
});
