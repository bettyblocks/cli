import validateComponent from '../src/validations/component';
import validatePrefab from '../src/validations/prefab';
import { Component, Prefab, Orientation } from '../src/types';

const { Vertical } = Orientation;

test('Throw when one of the components is invalid', () => {
  const components: { name: string }[] = [
    {
      name: 'HelloWorld',
    },
  ];

  expect(() => validateComponent(components as Component[])).toThrow();
});

test('Throw when two components have the same name', () => {
  const components: Component[] = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: Vertical,
      jsx: <div>jsx</div>,
      styles: 'styles',
    },
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: Vertical,
      jsx: <div>jsx</div>,
      styles: 'styles',
    },
  ];

  expect(() => validateComponent(components as Component[])).toThrow();
});

test("Don't throw when all components are valid", () => {
  const components: Component[] = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: Vertical,
      jsx: <div>jsx</div>,
      styles: 'styles',
    },
  ];

  expect(() => validateComponent(components)).not.toThrow();
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
      icon: 'prefab icon',
      category: 'Content',
      structure: [],
    },
  ];

  expect(() => validatePrefab(prefab));
});
