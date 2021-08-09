export const snakeCaseToCamelCase = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, $1 => {
    return $1
      .toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

export const toCamelKeys = (object: {}): {} => {
  return Object.entries(object).reduce((acc, [key, value]) => {
    const camelizedKey = snakeCaseToCamelCase(key);

    return {
      ...acc,
      [camelizedKey]: value,
    };
  }, {});
};
