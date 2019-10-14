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

const getComponentRefNames = (structure: ComponentRef[]): string[] =>
  structure.reduce(
    (acc: string[], { name, descendants }: ComponentRef): string[] => [
      ...acc,
      name,
      ...getComponentRefNames(descendants),
    ],
    [],
  );

export const checkNameReferences = (
  prefabs: Prefab[],
  components: Component[],
): void => {
  const componentNames = new Set(components.map(component => component.name));
  const prefabNames = new Set(
    prefabs.reduce(
      (acc: string[], { structure }: Prefab): string[] => [
        ...acc,
        ...getComponentRefNames(structure),
      ],
      [],
    ),
  );

  prefabNames.forEach(name => {
    if (!componentNames.has(name)) {
      throw new Error(`"${name}" references to non existing component`);
    }
  });
};
