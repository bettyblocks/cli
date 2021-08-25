import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { stringLiteral, File } from '@babel/types';
import { doTranspile } from '../components/transformers';

const generateInnerCode = (
  ast: File,
  keys: string[],
  remapKeys: Record<string, string> = {},
): void => {
  traverse(ast, {
    // tslint:disable-next-line: function-name
    ObjectProperty(path) {
      if (keys.includes(path.node.key.name)) {
        const value: string = generate(path.node.value).code;

        const newName = remapKeys[path.node.key.name];

        if (newName) {
          // eslint-disable-next-line no-param-reassign
          path.node.key.name = newName;
        }

        // Reassigningment is how this kind of traversal works
        // eslint-disable-next-line no-param-reassign
        path.node.value = stringLiteral(value);
      }
    },
  });
};

export default (
  code: string,
  keys: string[],
  enableNewTranspile?: boolean,
): string => {
  const source = enableNewTranspile ? doTranspile(code) : code;
  const ast: File = parse(source, {
    plugins: ['jsx'],
  });

  const remappedKeys: Record<string, string> = {};
  if (enableNewTranspile) {
    remappedKeys.jsx = 'transpiled';
  }

  generateInnerCode(ast, keys, remappedKeys);

  return generate(ast).code;
};
