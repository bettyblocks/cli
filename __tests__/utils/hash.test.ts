import test, { ExecutionContext } from 'ava';
import { Component } from '../../src/types';
import hash from '../../src/utils/hash';

type Context = ExecutionContext<unknown>;

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

test('generate hash from object should be the same every time', (t: Context): void => {
  t.is(hash(ComponentA), hash(ComponentA));
  t.is(hash(foo), hash(foo));
});

test('generate hash from a component with a different name should return different hash', (t: Context): void => {
  let ComponentB = { ...ComponentA };
  ComponentB.name = 'test';

  t.not(hash(ComponentA), hash(ComponentB));
});

test('generate hash from a component with a different orientation should return a different hash', (t: Context): void => {
  let ComponentB = { ...ComponentA };
  ComponentB.orientation = 'VERTICAL';

  t.not(hash(ComponentA), hash(ComponentB));
});

test('generate hash from a component with a different jsx should return different hash', (t: Context): void => {
  let ComponentB = { ...ComponentA };
  ComponentB.jsx = `() => {
    return <span>Some Component</span>;
  }`;

  t.not(hash(ComponentA), hash(ComponentB));
});

test('generate hash from a component with a different styles should return different hash', (t: Context): void => {
  let ComponentB = { ...ComponentA };
  ComponentB.styles = `() => {
    return {
      root: {
        backgroundColor: 'green',
      },
    };
  }`;

  t.not(hash(ComponentA), hash(ComponentB));
});

test('generate hash from a component with a different type should return a different hash', (t: Context): void => {
  let ComponentB = { ...ComponentA };
  ComponentB.type = 'ROW';

  t.not(hash(ComponentA), hash(ComponentB));
});

test('generate hash from a component with a different allowed types should return a different hash', (t: Context): void => {
  let ComponentB = { ...ComponentA };
  ComponentB.allowedTypes = ['COLUMN', 'ROW'];

  t.not(hash(ComponentA), hash(ComponentB));
});
