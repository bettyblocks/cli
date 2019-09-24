import { ParsedQuery } from 'query-string';

export default (
  search: ParsedQuery<string>,
  keyNew: string,
  valueNew: string,
): string => {
  const newSearch = {
    ...(search as { [key: string]: string }),
    [keyNew]: valueNew,
  };

  return `?${Object.keys(newSearch)
    .map(key => `${key}=${newSearch[key]}`)
    .join('&')}`;
};
