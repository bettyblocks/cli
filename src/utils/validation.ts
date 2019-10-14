import { ObjectSchema } from '@hapi/joi';
import { Component, ComponentRef, Prefab } from '../types';

export const validate = <T extends { name: string }>(
  schema: ObjectSchema,
  list: T[],
): void => {
  list.forEach((item: T): void => {
    const { error } = schema.validate(item);

    if (typeof error !== 'undefined') {
      throw error;
    }
  });
};

export const findDuplicates = <T extends { name: string }>(list: T[]): void => {
  list.reduce((acc: string[], { name }: T): string[] => {
    if (acc.includes(name)) {
      throw new Error(`Duplicate name "${name}" found`);
    }

    return [...acc, name];
  }, []);
};

const checkComponentRefNames = (names: Set<string>) => ({
  name,
  descendants,
}: ComponentRef): void => {
  if (!names.has(name)) {
    throw new Error(`"${name}" references to non existing component`);
  }

  descendants.forEach(checkComponentRefNames(names));
};

export const checkNameReferences = (
  prefabs: Prefab[],
  components: Component[],
): void => {
  const componentNames = new Set(components.map(({ name }) => name));

  prefabs.forEach(({ structure }) => {
    structure.forEach(checkComponentRefNames(componentNames));
  });
};
