import { ObjectSchema } from '@hapi/joi';

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

export const validateDuplicateNames = <T extends { name: string }>(
  typeName: string,
  list: T[],
): void => {
  list.reduce((acc: string[], { name }) => {
    if (acc.includes(name)) {
      throw new Error(`You have two ${typeName}s with the name: ${name}`);
    }

    return [...acc, name];
  }, []);
};
