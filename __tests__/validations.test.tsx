import validateComponents from '../src/validations/component';
import validatePrefab from '../src/validations/prefab';
import { Component, Prefab } from '../src/types';

test('Throw when one of the components is invalid', () => {
  const components: { name: string }[] = [
    {
      name: 'HelloWorld',
    },
  ];

  expect(() => validateComponents(components as Component[])).toThrow();
});

test('Throw when two components have the same name', () => {
  const components: Component[] = [
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
  ];

  expect(() => validateComponents(components as Component[])).toThrow();
});

test("Don't throw when all components are valid", () => {
  const components: Component[] = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ];

  expect(() => validateComponents(components)).not.toThrow();
});

test('Throw when one of the prefabs is invalid', () => {
  const prefab: { name: string }[] = [
    {
      name: 'Component Name',
    },
  ];

  expect(() => validatePrefab(prefab as Prefab[])).toThrow();
});

test("Don't throw when all prefabs are valid", () => {
  const prefab: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'AccordionIcon',
      category: 'Content',
      structure: [],
    },
  ];

  expect(() => validatePrefab(prefab));
});

test('Throw when one of the prefabs options is invalid', () => {
  const prefab: Prefab[] = [
    ({
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
    } as unknown) as Prefab,
  ];

  expect(() => validatePrefab(prefab)).toThrow();
});

test('Throw when the prefabs option type is not referring to one the correct types', () => {
  const prefab: Prefab[] = [
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
  ];

  expect(() => validatePrefab(prefab as Prefab[])).toThrow();
});

test('Throw when two options with the same key are being used', () => {
  const prefab: Prefab[] = [
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
  ];

  expect(() => validatePrefab(prefab as Prefab[])).toThrow();
});
