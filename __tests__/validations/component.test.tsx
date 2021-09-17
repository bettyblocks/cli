import test, { ExecutionContext } from 'ava';

import { Component, Prefab } from '../../src/types';
import validateComponents from '../../src/validations/component';
import validatePrefabs from '../../src/validations/prefab';

type Context = ExecutionContext<unknown>;

test('Throw when one of the components is invalid', (t: Context): void => {
  const components: { name: string }[] = [
    {
      name: 'HelloWorld',
    },
  ];

  t.throws(() => validateComponents(components as Component[]));
});

test('Throw when component styleType is not a valid type', (t: Context): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
      styleType: 'YEET',
    },
  ] as Component[];

  t.throws(() => validateComponents(components));
});

test('Throw when two components have the same name', (t: Context): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ] as Component[];

  t.throws(() => validateComponents(components));
});

test("Don't throw when all components are valid", (t: Context): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ] as Component[];

  t.notThrows(() => validateComponents(components));
});

test('Throw when one of the prefabs is invalid', (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
    },
  ] as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test("Don't throw when all prefabs are valid", (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
      icon: 'AccordionIcon',
      category: 'Content',
      structure: [],
    },
  ] as Prefab[];

  t.notThrows(() => validatePrefabs(prefabs));
});

test('Throw when one of the prefabs options is invalid', (t: Context): void => {
  const prefabs = ([
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
              invalid: ' ',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown) as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test('Does not throw when prefabs style override options are valid', (t: Context): void => {
  const prefabs = ([
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Button',
          style: {
            name: 'filled',
            overwrites: {
              backgroundColor: 'blue',
              padding: ['1', '1'],
            },
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown) as Prefab[];

  t.notThrows(() =>
    validatePrefabs(prefabs, { Button: { styleType: 'BUTTON' } }),
  );
});

test('Throw when one of the prefabs style override string options is invalid', (t: Context): void => {
  const prefabs = ([
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Button',
          style: {
            name: 'filled',
            overwrites: {
              backgroundColor: 1,
            },
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown) as Prefab[];

  t.throws(() => validatePrefabs(prefabs, { Button: { styleType: 'BUTTON' } }));
});

test('Throw when one of the prefabs style override array options is invalid', (t: Context): void => {
  const prefabs = ([
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Button',
          style: {
            name: 'filled',
            overwrites: {
              padding: ['1', '1', '1', '1', '1'],
            },
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown) as Prefab[];

  t.throws(() => validatePrefabs(prefabs, { Button: { styleType: 'BUTTON' } }));
});

test('Throw when style name is non-alphanumeric', (t: Context): void => {
  const prefabs = ([
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          style: {
            name: 'invalidCharacter%',
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown) as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test('Dont throw when prefab component has a ref', (t: Context): void => {
  const prefabs = ([
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          ref: {
            id: '#id',
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown) as Prefab[];

  validatePrefabs(prefabs);
  t.pass();
});

test('Throw when the prefabs option type is not referring to one the correct types', (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'SOMETHING',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});

test('Throw when two options with the same key are being used', (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'Option 1',
              key: 'sameKey',
              type: 'TEXT',
            },
            {
              value: '',
              label: 'Option 2',
              key: 'sameKEY',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as Prefab[];

  t.throws(() => validatePrefabs(prefabs));
});
