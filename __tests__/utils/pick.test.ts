import { describe, expect, it } from 'bun:test';

import { pick } from '../../src/utils/pick';

describe('pick', () => {
  describe('basic functionality', () => {
    it('should pick specified properties from an object', () => {
      const source = { a: 1, b: 2, c: 3, d: 4 };
      const result = pick(source, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should pick a single property', () => {
      const source = { age: 30, city: 'New York', name: 'John' };
      const result = pick(source, ['name']);

      expect(result).toEqual({ name: 'John' });
    });

    it('should pick all properties when all keys are specified', () => {
      const source = { x: 10, y: 20 };
      const result = pick(source, ['x', 'y']);

      expect(result).toEqual({ x: 10, y: 20 });
    });
  });

  describe('edge cases', () => {
    it('should return empty object when picking from empty object', () => {
      const source = {};
      const result = pick(source, ['nonexistent'] as never[]);

      expect(result).toEqual({});
    });

    it('should return empty object when no keys are specified', () => {
      const source = { a: 1, b: 2, c: 3 };
      const result = pick(source, []);

      expect(result).toEqual({});
    });

    it('should handle objects with undefined values', () => {
      const source = { a: 1, b: undefined, c: null };
      const result = pick(source, ['a', 'b', 'c']);

      expect(result).toEqual({ a: 1, b: undefined, c: null });
    });

    it('should handle objects with falsy values', () => {
      const source = { a: 0, b: false, c: '', d: null };
      const result = pick(source, ['a', 'b', 'c', 'd']);

      expect(result).toEqual({ a: 0, b: false, c: '', d: null });
    });
  });

  describe('object immutability', () => {
    it('should not modify the original object', () => {
      const source = { a: 1, b: 2, c: 3 };
      const originalSource = { ...source };

      pick(source, ['a', 'b']);

      expect(source).toEqual(originalSource);
    });

    it('should return a new object instance', () => {
      const source = { a: 1, b: 2 };
      const result = pick(source, ['a', 'b']);

      expect(result).not.toBe(source);
    });

    it('should perform shallow copy of values', () => {
      const nestedObj = { nested: true };
      const source = { a: nestedObj, b: 2 };
      const result = pick(source, ['a']);

      expect(result.a).toBe(nestedObj); // Same reference for nested objects
    });
  });

  describe('different data types', () => {
    it('should handle string values', () => {
      const source = { greeting: 'Hello', name: 'Alice' };
      const result = pick(source, ['name']);

      expect(result).toEqual({ name: 'Alice' });
    });

    it('should handle number values', () => {
      const source = { age: 25, score: 95.5 };
      const result = pick(source, ['age', 'score']);

      expect(result).toEqual({ age: 25, score: 95.5 });
    });

    it('should handle boolean values', () => {
      const source = { isActive: true, isDeleted: false };
      const result = pick(source, ['isActive']);

      expect(result).toEqual({ isActive: true });
    });

    it('should handle array values', () => {
      const source = { items: [1, 2, 3], tags: ['a', 'b'] };
      const result = pick(source, ['items']);

      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('should handle nested object values', () => {
      const source = {
        settings: { theme: 'dark' },
        user: { age: 30, name: 'John' },
      };
      const result = pick(source, ['user']);

      expect(result).toEqual({ user: { age: 30, name: 'John' } });
    });

    it('should handle function values', () => {
      const func = (): string => 'test';
      const source = { callback: func, data: 'value' };
      const result = pick(source, ['callback']);

      expect(result).toEqual({ callback: func });
    });
  });

  describe('complex scenarios', () => {
    it('should work with objects having many properties', () => {
      const source = {
        category: 'electronics',
        description: 'A great product',
        id: 1,
        inStock: true,
        metadata: { created: '2023-01-01' },
        name: 'Product',
        price: 99.99,
        tags: ['new', 'popular'],
      };

      const result = pick(source, ['id', 'name', 'price', 'inStock']);

      expect(result).toEqual({
        id: 1,
        inStock: true,
        name: 'Product',
        price: 99.99,
      });
    });

    it('should handle duplicate keys in the keys array', () => {
      const source = { a: 1, b: 2, c: 3 };
      const result = pick(source, ['a', 'b', 'a'] as ('a' | 'b')[]);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should preserve property order based on iteration order', () => {
      const source = { a: 1, b: 2, c: 3 };
      const result = pick(source, ['a', 'b', 'c']);

      expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
    });
  });
});
