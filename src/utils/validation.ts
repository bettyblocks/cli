import { ObjectSchema } from '@hapi/joi';

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
