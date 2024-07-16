const escapeRegExp = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const toRegexLines = (text: string) => {
  const textRegex = text
    .split('\n')
    .map((line) =>
      line.trim() === '' ? false : `(${escapeRegExp(line.trim())})`,
    )
    .filter((x) => x)
    .join('.+');
  return new RegExp(textRegex, 's');
};

export default toRegexLines;
