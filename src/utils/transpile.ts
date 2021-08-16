import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { stringLiteral, File } from '@babel/types';
import { doTranspile } from '../components/transformers';

const generateInnerCode = (ast: File, keys: string[]): void => {
  traverse(ast, {
    // tslint:disable-next-line: function-name
    ObjectProperty(path) {
      if (keys.includes(path.node.key.name)) {
        const value: string = generate(path.node.value).code;

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

  generateInnerCode(ast, keys);

  return generate(ast).code;
};
