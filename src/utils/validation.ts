import { ObjectSchema, ValidationResult } from '@hapi/joi';
import { Component, ComponentReference, Prefab } from '../types';

export const validate = <T extends { jsx?: string; name: string }>(
  schema: ObjectSchema,
  item: T,
): void => {
  const { error }: ValidationResult = schema.validate(item);

  const type = item.jsx ? 'Component' : 'Prefab';

  if (typeof error !== 'undefined') {
    throw new Error(`Property: ${error.message} at ${type}: ${item.name}`);
  }
};

export const findDuplicates = <T extends { name: string }>(
  list: T[],
  type: string,
): void => {
  list.reduce((acc: string[], { name }: T): string[] => {
    if (acc.includes(name)) {
      throw new Error(`The name "${name}" is used for multiple ${type}s`);
    }

    return [...acc, name];
  }, []);
};

const checkComponentReferenceNames = (
  names: Set<string>,
  prefabName: string,
) => ({ name, descendants }: ComponentReference): void => {
  if (!names.has(name)) {
    throw new Error(
      `Prefab: ${prefabName} references to non-existing component "${name}"`,
    );
  }

  descendants.forEach(checkComponentReferenceNames(names, prefabName));
};

export const checkNameReferences = (
  prefabs: Prefab[],
  components: Component[],
): void => {
  const componentNames: Set<string> = new Set(
    components.map(({ name }: Component): string => name),
  );

  prefabs.forEach(({ name, structure }: Prefab): void => {
    structure.forEach(checkComponentReferenceNames(componentNames, name));
  });
};
