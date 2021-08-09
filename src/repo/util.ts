import camelCaseKeys from 'camelcase-keys';

export function camelCase(
  instance: Record<string, unknown>,
  fields: string[],
): void {
  fields.forEach((key: string): void => {
    // eslint-disable-next-line no-param-reassign
    instance[key] = camelCaseKeys(instance[key] as Record<string, unknown>, {
      deep: true,
    });
  });
}
