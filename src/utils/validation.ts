import chalk from 'chalk';

import type { Component, Prefab, PrefabReference } from '../types';

const fromStructure = <
  KString extends string & keyof T,
  KObject extends Record<string, K>,
  K extends KString | KObject,
  T extends object,
>(
  object: T,
  structure: K,
): string | undefined => {
  if (typeof structure === 'string') {
    const value = object[structure as KString];

    if (typeof value === 'string' || typeof value === 'undefined') {
      return value;
    }
  }

  const [[k, v]] = Object.entries(structure);

  return fromStructure(object[k as KString] as unknown as T, v);
};

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
  const seen = new Set<string>();

  for (const item of list) {
    let value;

    try {
      value = fromStructure(item, structure);
    } catch {
      // all is well in the world
    }

    if (typeof value === 'string') {
      const valueLower = value.toLowerCase();

      if (seen.has(valueLower)) {
        throw new Error(
          chalk.red(
            `\nThe name "${valueLower}" is used for multiple ${type}s\n`,
          ),
        );
      }

      seen.add(valueLower);
    }
  }
};

const checkComponentReferenceNames =
  (names: Set<string>, prefabName: string) =>
  (prefabReference: PrefabReference): void => {
    if (
      prefabReference.type === undefined ||
      prefabReference.type === 'COMPONENT'
    ) {
      const { name, descendants } = prefabReference;

      if (!names.has(name)) {
        throw new Error(
          chalk.red(
            `\nPrefab: ${prefabName} references to non-existing component "${name}"\n`,
          ),
        );
      }
      descendants.forEach(checkComponentReferenceNames(names, prefabName));
    } else if (prefabReference.type === 'WRAPPER') {
      const { descendants } = prefabReference;

      descendants.forEach(checkComponentReferenceNames(names, prefabName));
    }
  };

export const checkNameReferences = (
  prefabs: Prefab[],
  components: Component[],
): void => {
  const componentNames = new Set<string>(
    components.map(({ name }: Component): string => name),
  );

  prefabs.forEach(({ name, structure }: Prefab): void => {
    structure.forEach(checkComponentReferenceNames(componentNames, name));
  });
};

export const checkOptionCategoryReferences = (prefabs: Prefab[]): void => {
  const innerFn = (structure: PrefabReference[], name: string): void => {
    structure.forEach((prefabReference) => {
      if (
        prefabReference.type === undefined ||
        prefabReference.type === 'COMPONENT' ||
        prefabReference.type === 'WRAPPER'
      ) {
        if (prefabReference?.optionCategories) {
          prefabReference.optionCategories.forEach((category) => {
            category.members.forEach((member) => {
              if (
                !prefabReference.options.some((option) => member === option.key)
              ) {
                throw new Error(
                  chalk.red(
                    `\nOption category member: "${member}" references to non-existing option\n\nat prefab: ${name}`,
                  ),
                );
              }
            });
          });
        }

        innerFn(prefabReference.descendants, name);
      }
    });
  };

  prefabs.forEach((prefab) => {
    innerFn(prefab.structure, prefab.name);
  });
};
