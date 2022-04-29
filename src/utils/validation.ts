import chalk from 'chalk';

import { Component, Prefab, PrefabComponent } from '../types';

function fromStructure<
  KString extends string & keyof T,
  KObject extends Record<string, K>,
  K extends KString | KObject,
  T extends object,
>(object: T, structure: K): string | void {
  if (typeof structure === 'string') {
    const value = object[structure as KString];

    if (typeof value === 'string' || typeof value === 'undefined') {
      return value;
    }
  }

  const [[k, v]] = Object.entries(structure);

  return fromStructure(object[k as KString] as unknown as T, v);
}

export const findDuplicates = <
  KString extends string & keyof T,
  KObject extends Record<string, KString | KObject>,
  K extends KString | KObject,
  T extends object,
>(
  list: T[],
  type: string,
  structure: K,
): void => {
  list.reduce((acc: Set<string>, item: T): Set<string> => {
    let value;

    try {
      value = fromStructure(item, structure);
    } catch {
      // all is well in the world
    }

    if (typeof value === 'string') {
      const valueLower = value.toLowerCase();

      if (acc.has(valueLower)) {
        throw new Error(
          chalk.red(
            `\nThe name "${valueLower}" is used for multiple ${type}s\n`,
          ),
        );
      }

      acc.add(valueLower);
    }

    return acc;
  }, new Set());
};

const checkComponentReferenceNames =
  (names: Set<string>, prefabName: string) =>
  ({ name, descendants }: PrefabComponent): void => {
    if (!names.has(name)) {
      throw new Error(
        chalk.red(
          `\nPrefab: ${prefabName} references to non-existing component "${name}"\n`,
        ),
      );
    }
    if (descendants) {
      descendants.forEach(checkComponentReferenceNames(names, prefabName));
    }
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
