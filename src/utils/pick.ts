/**
 * Creates an object composed of the picked object properties.
 * @param object The source object.
 * @param keys The property keys to pick.
 * @returns The new object.
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  object: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
};
