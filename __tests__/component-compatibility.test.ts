/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from 'bun:test';

import toCompatibility from '../src/components/compatibility';

test('extract compatibility for simple button with custom trigger and function', (): void => {
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
      <button onClick={handleClick}>
        Knopje
      </button>
    );
  })(),
  styles: () => () => ({}),
}))();
  `;

  const compatibility = toCompatibility(code);

  expect(compatibility).toEqual({
    triggers: ['CustomTrigger'],
    functions: ['CustomFunction'],
    interactions: {},
  });
});

test('extract compatibility for complex button with multiple triggers and functions', (): void => {
  const code = `
  (() => ({
    name: 'Button',
    type: 'BUTTON',
    icon: 'ButtonIcon',
    orientation: 'VERTICAL',
    allowedTypes: [],
    jsx: (() => {
      const { type, name } = options;
      const handleClick = event => {
        B.triggerEvent('CustomTrigger1', event);
      };
      const handleClick = event => {
        B.triggerEvent('CustomTrigger2', event);
      };
      const handleClick = event => {
        B.triggerEvent('CustomTrigger3', event);
      };
      useEffect(() => {
        B.defineFunction('CustomFunction1', event => {
          console.log(event);
        });
        B.defineFunction('CustomFunction2', event => {
          console.log(event);
        });
        B.defineFunction('CustomFunction3', event => {
          console.log(event);
        });
      }, []);
      return (
        // eslint-disable-next-line react/button-has-type
        <button
          type={B.env !== 'dev' && type ? type : 'button'}
          onClick={handleClick}
          className={classes.root}
        >
          {name}
        </button>
      );
    })(),
    styles: B => t => {
      const style = new B.Styling(t);
      const getSpacing = (option, index, platform = 'Desktop') =>
        style.getSpacing(option[index], platform);
      const getWidth = (custom, width, margin) =>
        width === 'custom' && custom === 'auto'
          ? 'auto'
          : \`calc(\${width === 'custom' ? custom : width} - \${getSpacing(
              margin,
              1,
            )} - \${getSpacing(margin, 3)})\`;
      return {
        root: {
          boxSizing: 'border-box',
          position: 'relative',
          display: 'inline-flex',
          justifyContent: 'center',
          padding: '0.5rem 1rem',
          color: 'rgba(255, 255, 255, 1)',
          fontSize: '1rem',
          cursor: 'pointer',
          outline: 'none',
          '&:hover': {
            boxShadow: '0.0625rem 0.0625rem 0.0625rem 0 rgba(0, 31, 63, 0.5)',
          },
          alignSelf: ({ options: { align } }) => align,
          width: ({ options: { custom, width, margin } }) =>
            getWidth(custom, width, margin),
          marginTop: ({ options: { margin } }) =>
            style.getSpacing(margin[0], 'Desktop'),
          marginRight: ({ options: { margin } }) =>
            style.getSpacing(margin[1], 'Desktop'),
          marginBottom: ({ options: { margin } }) =>
            style.getSpacing(margin[2], 'Desktop'),
          marginLeft: ({ options: { margin } }) =>
            style.getSpacing(margin[3], 'Desktop'),
          border: ({ options: { color } }) =>
            \`0.0625rem solid \${style.getColor(color)}\`,
          borderRadius: ({ options: { borderRadius } }) =>
            style.getBorderRadius(borderRadius),
          background: ({ options: { color } }) => style.getColor(color),
        },
      };
    },
  }))();
  `;

  const compatibility = toCompatibility(code);

  expect(compatibility).toEqual({
    triggers: ['CustomTrigger1', 'CustomTrigger2', 'CustomTrigger3'],
    functions: ['CustomFunction1', 'CustomFunction2', 'CustomFunction3'],
    interactions: {},
  });
});

test('extract compatibility for simple button with custom trigger with changing input', (): void => {
  const code = `
(() => ({
  name: 'Button',
  type: 'BUTTON',
  icon: 'ButtonIcon',
  orientation: 'VERTICAL',
  allowedTypes: [],
  jsx: (() => {
    const handleClick1 = event => {
      B.triggerEvent('CustomTrigger1', event);
    };
    const handleClick2 = () => {
      B.triggerEvent('CustomTrigger2');
    };
    const handleClick3 = () => {
      B.triggerEvent('CustomTrigger3', true);
    };
    const handleClick3 = () => {
      B.triggerEvent('CustomTrigger4', 27);
    };
    const handleClick3 = () => {
      B.triggerEvent('CustomTrigger5', 'value');
    };
    const handleClick3 = () => {
      B.triggerEvent('CustomTrigger6', [ 'value1', 'value2', 'value3' ]);
    };
    const handleClick3 = () => {
      B.triggerEvent('CustomTrigger7', { name1: 'value1', name2: 'value2', name3: 'value3' });
    };
    return (
      <button onClick={handleClick}>
        Knopje
      </button>
    );
  })(),
  styles: () => () => ({}),
}))();
  `;

  const compatibility = toCompatibility(code);

  expect(compatibility).toEqual({
    triggers: [
      'CustomTrigger1',
      'CustomTrigger2',
      'CustomTrigger3',
      'CustomTrigger4',
      'CustomTrigger5',
      'CustomTrigger6',
      'CustomTrigger7',
    ],
    functions: [],
    interactions: {},
  });
});

test('extract compatibility for simple button with custom inline triggers', (): void => {
  const code = `
(() => ({
  name: 'Button',
  type: 'BUTTON',
  icon: 'ButtonIcon',
  orientation: 'VERTICAL',
  allowedTypes: [],
  jsx: (() => {
    const { triggerEvent } = B;
    return (
      <button
        onCustom1={ () => B.triggerEvent('CustomTrigger1') }
        onCustom2={ () => triggerEvent('CustomTrigger2') }
        onCustom3={ event => B.triggerEvent('CustomTrigger3', event) }
        onCustom4={ event => triggerEvent('CustomTrigger4', event) }
      >
        Knopje
      </button>
    );
  })(),
  styles: () => () => ({}),
}))();
  `;

  const compatibility = toCompatibility(code);

  expect(compatibility).toEqual({
    triggers: [
      'CustomTrigger1',
      'CustomTrigger2',
      'CustomTrigger3',
      'CustomTrigger4',
    ],
    functions: [],
    interactions: {},
  });
});

test('compatibility galore', (): void => {
  const code = `
(() => ({
  name: 'Button',
  type: 'BUTTON',
  icon: 'ButtonIcon',
  orientation: 'VERTICAL',
  allowedTypes: [],
  jsx: (() => {
    const { triggerEvent } = B;
    const handleClick1 = () => {
      B.triggerEvent('CustomTrigger1');
    };
    const handleClick2 = event => {
      B.triggerEvent('CustomTrigger2', event);
    };
    /**
     * @name Action
     * @param {Number} arg1
     * @param {String} arg2
     * @returns {Void}
     */
    const handleClick3 = () => {
      triggerEvent('CustomTrigger3');
    };
    const handleClick4 = event => {
      triggerEvent('CustomTrigger4', event);
    };
    const handleClick5 = event => {
      const name = 'value';
      funct(name);
      B.triggerEvent('CustomTrigger5', event);
      triggerEvent('CustomTrigger6', event);
      funct(name);
    };
    B.triggerEvent('CustomTrigger7');
    B.triggerEvent('CustomTrigger8', {name: 'value'});
    triggerEvent('CustomTrigger9');
    triggerEvent('CustomTrigger10', {name: 'value'});
    useEffect(() => {
      B.defineFunction('CustomFunction1', () => {});
    }, []);
    useEffect(() => {
      B.defineFunction('CustomFunction2', event => {
        console.log(event);
      });
    }, []);
    useEffect(() => {
      defineFunction('CustomFunction3', () => {});
    }, []);
    useEffect(() => {
      defineFunction('CustomFunction4', event => {
        console.log(event);
      });
    }, []);
    useEffect(() => {
      const name = 'value';
      funct(name);
      B.defineFunction('CustomFunction5', event => {
        console.log(event);
      });
      defineFunction('CustomFunction6', event => {
        console.log(event);
      });
      funct(name);
    }, []);
    B.defineFunction('CustomFunction7', event => {
      console.log(event);
    });
    B.defineFunction('CustomFunction8', () => {});
    defineFunction('CustomFunction9', event => {
      console.log(event);
    });
    defineFunction('CustomFunction10', () => {});
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

  expect(compatibility).toEqual({
    triggers: [
      'CustomTrigger1',
      'CustomTrigger2',
      'CustomTrigger3',
      'CustomTrigger4',
      'CustomTrigger5',
      'CustomTrigger6',
      'CustomTrigger7',
      'CustomTrigger8',
      'CustomTrigger9',
      'CustomTrigger10',
    ],
    functions: [
      'CustomFunction1',
      'CustomFunction2',
      'CustomFunction3',
      'CustomFunction4',
      'CustomFunction5',
      'CustomFunction6',
      'CustomFunction7',
      'CustomFunction8',
      'CustomFunction9',
      'CustomFunction10',
    ],
    interactions: {
      Action: {
        parameters: {
          arg1: ['Number'],
          arg2: ['String'],
        },
        returnType: ['Void'],
      },
    },
  });
});
