import chalk from 'chalk';

import { Component, Prefab, PrefabComponent } from '../types';

export const findDuplicates = <T extends { name: string }>(
  list: T[],
  type: string,
): void => {
  list.reduce((acc: string[], { name }: T): string[] => {
    if (acc.includes(name)) {
      throw new Error(
        chalk.red(`\nThe name "${name}" is used for multiple ${type}s\n`),
      );
    }

    return [...acc, name];
  }, []);
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
