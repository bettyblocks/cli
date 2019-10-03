import { Component, Prefab } from '../types';
import { ObjectSchema } from '@hapi/joi';

export const validateDuplicateNames: (
  components: (Component | Prefab)[],
) => void = (components: (Component | Prefab)[]): void => {
  const names: { [name: string]: number } = components.reduce(
    (acc: { [name: string]: number }, { name }: { name: string }) => ({
      ...acc,
      [name]: acc[name] + 1 || 1,
    }),
    {},
  );

  const duplicateNames = Object.keys(names).filter(
    (name: string): boolean => names[name] > 1,
  );

  if (duplicateNames.length !== 0) {
    throw new Error(
      ` The following component(s) have duplicate name(s): ${duplicateNames}`,
    );
  }
};

export const validate = <T extends { name: string }>(
  typeName: string,
  schema: ObjectSchema,
  list: T[],
): void => {
  list.forEach((item: T) => {
    const { error } = schema.validate(item);

    if (typeof error !== 'undefined') {
      const { name } = item;
      const { message } = error;

      throw new Error(`Build error in ${typeName} ${name}: ${message}`);
    }
  });
};
