import { Component } from '../../src/types';
import hash from '../../src/utils/hash';

const ComponentA: Component = {
  name: 'Test',
  orientation: 'HORIZONTAL',
  jsx: `() => {
    return <div>Some Component</div>;
  }`,
  styles: `() => {
    return {
      root: {
        backgroundColor: 'red',
      },
    };
  }`,
  type: 'COLUMN',
  allowedTypes: [],
  styleType: '',
};

const foo = {
  bar: 'baz',
};

test('generate hash from object should be the same every time', () => {
  expect(hash(ComponentA)).toBe(hash(ComponentA));
  expect(hash(foo)).toBe(hash(foo));
});

test('generate hash from a component with a different name should return different hash', () => {
  let ComponentB = { ...ComponentA };
  ComponentB.name = 'test';

  expect(hash(ComponentA)).not.toBe(hash(ComponentB));
});

test('generate hash from a component with a different orientation should return a different hash', () => {
  let ComponentB = { ...ComponentA };
  ComponentB.orientation = 'VERTICAL';

  expect(hash(ComponentA)).not.toBe(hash(ComponentB));
});

test('generate hash from a component with a different jsx should return different hash', () => {
  let ComponentB = { ...ComponentA };
  ComponentB.jsx = `() => {
    return <span>Some Component</span>;
  }`;

  expect(hash(ComponentA)).not.toBe(hash(ComponentB));
});

test('generate hash from a component with a different styles should return different hash', () => {
  let ComponentB = { ...ComponentA };
  ComponentB.styles = `() => {
    return {
      root: {
        backgroundColor: 'green',
      },
    };
  }`;

  expect(hash(ComponentA)).not.toBe(hash(ComponentB));
});

test('generate hash from a component with a different type should return a different hash', () => {
  let ComponentB = { ...ComponentA };
  ComponentB.type = 'ROW';

  expect(hash(ComponentA)).not.toBe(hash(ComponentB));
});

test('generate hash from a component with a different allowed types should return a different hash', () => {
  let ComponentB = { ...ComponentA };
  ComponentB.allowedTypes = ['COLUMN', 'ROW'];

  expect(hash(ComponentA)).not.toBe(hash(ComponentB));
});
