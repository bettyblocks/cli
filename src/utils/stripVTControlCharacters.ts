export const stripVTControlCharacters = (string: string | undefined): string =>
  string
    ? string.replace(
        new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g'),
        '',
      )
    : '';
