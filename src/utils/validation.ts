import { ObjectSchema, ValidationResult } from '@hapi/joi';
import { Component, ComponentReference, Prefab } from '../types';

export const validate = <T extends { name: string }>(
  schema: ObjectSchema,
  item: T,
): void => {
  const { error }: ValidationResult = schema.validate(item);

  if (typeof error !== 'undefined') {
    throw error;
  }
};

export const findDuplicates = <T extends { name: string }>(list: T[]): void => {
  list.reduce((acc: string[], { name }: T): string[] => {
    if (acc.includes(name)) {
      throw new Error(`Duplicate name "${name}" found`);
    }

    return [...acc, name];
  }, []);
};

const checkComponentReferenceNames = (names: Set<string>) => ({
  name,
  descendants,
}: ComponentReference): void => {
  if (!names.has(name)) {
    throw new Error(`"${name}" references to non existing component`);
  }

  descendants.forEach(checkComponentReferenceNames(names));
};

export const checkNameReferences = (
  prefabs: Prefab[],
  components: Component[],
): void => {
  const componentNames: Set<string> = new Set(
    components.map(({ name }: Component): string => name),
  );

  prefabs.forEach(({ structure }: Prefab): void => {
    structure.forEach(checkComponentReferenceNames(componentNames));
  });
};
