import chalk from 'chalk';

import { Component, Prefab, PrefabComponent } from '../types';

export const findDuplicates = <T extends object>(
  list: T[],
  type: string,
  key = 'name',
): void => {
  list.reduce((acc: Set<string>, x: T): Set<string> => {
    const value = x[key as keyof T];

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

const checkComponentReferenceNames = (
  names: Set<string>,
  prefabName: string,
) => ({ name, descendants }: PrefabComponent): void => {
  if (!names.has(name)) {
    throw new Error(
      chalk.red(
        `\nPrefab: ${prefabName} references to non-existing component "${name}"\n`,
      ),
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
