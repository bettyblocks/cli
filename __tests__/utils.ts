// This helper function is used to clean up the output of the terminal
// it removes control characters from the string (like colors \u001B)
// this is useful for testing the output of the terminal, and is only used in tests
export const stripVTControlCharacters = (string: string | undefined): string =>
  string
    ? string.replace(
        new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g'),
        '',
      )
    : '';
