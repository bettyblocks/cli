import { validateSchema as validateComponent } from '../src/validations/component';
import { validateSchema as validatePrefab } from '../src/validations/prefab';
import { Component, Prefab } from '../src/types';

test('Check whether the component has the right structure', () => {
  const components: unknown[] = [
    {
      name: 'Blaat',
      icon: 'icon',
      category: 'category',
      type: 'type',
      allowedTypes: 'allowedTypes',
      orientation: 'orientation',
      jsx: 'jsx',
      styles: 'styles',
    },
  ];

  expect(() => validateComponent(components as Component[]));
});

test('Check whether the component has the right structure and throw an error', () => {
  const components: unknown[] = [
    {
      name: 'name',
    },
  ];

  expect(() => validateComponent(components as Component[])).toThrow();
});

test('Check whether the prefab has the right structure', () => {
  const prefab: unknown[] = [
    {
      name: 'Component Name',
      icon: 'prefab icon',
      category: 'Content',
      structure: [],
    },
  ];

  expect(() => validatePrefab(prefab as Prefab[]));
});

test('Check whether the prefab has the right structure and throw an error', () => {
  const prefab: unknown[] = [
    {
      name: 'Component Name',
    },
  ];

  expect(() => {
    validatePrefab(prefab as Prefab[]);
  }).toThrow();
});
