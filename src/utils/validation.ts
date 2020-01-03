import chalk from 'chalk';

import { Component, ComponentReference, ComponentSet, Prefab } from '../types';

const VALID_NAME_PATTERN = /@[a-z0-9-_]+\/[a-z0-9-_]+\/[a-zA-Z0-9]+$/;

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

const validateScope = (scopes: string[], name: string): void => {
  if (!scopes.some(scope => name.startsWith(scope))) {
    throw new Error(
      `The name "${name}" has an unexpected organisation. Expected one of "${scopes.join(
        ', ',
      )}".`,
    );
  }
};

const validateName = (name: string): void => {
  if (!VALID_NAME_PATTERN.test(name)) {
    throw new Error(
      `The name "${name}" is invalid, please use the following convention: "@organisation/set/MyComponent".`,
    );
  }
};

const validateRefExists = (names: Set<string>, prefabName: string) => ({
  name,
  descendants,
}: ComponentReference): void => {
  if (!names.has(name)) {
    throw new Error(
      `Prefab: ${prefabName} references non-existing component "${name}".`,
    );
  }

  descendants.forEach(validateRefExists(names, prefabName));
};

export const validateNameAndRefs = (
  { prefabs, components }: ComponentSet,
  scopes: string[],
): void => {
  const componentNames: Set<string> = new Set(
    components.map(({ name }: Component): string => name),
  );

  componentNames.forEach(name => {
    validateScope(scopes, name);
    validateName(name);
  });

  prefabs.forEach(({ name, structure }: Prefab): void => {
    validateScope(scopes, name);
    validateName(name);

    structure.forEach(ref => {
      validateName(ref.name);
      validateRefExists(componentNames, name)(ref);
    });
  });
};
