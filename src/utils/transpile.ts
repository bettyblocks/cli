import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { type File, stringLiteral } from '@babel/types';

const generateInnerCode = (ast: File, keys: string[]): void => {
  traverse(ast, {
    ObjectProperty(path) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (keys.includes(path.node.key.name)) {
        const value: string = generate(path.node.value).code;

        // Reassigningment is how this kind of traversal works

        path.node.value = stringLiteral(value);
      }
    },
  });
};

export default (code: string, keys: string[]): string => {
  const ast: File = parse(code, {
    plugins: ['jsx'],
  });

  generateInnerCode(ast, keys);

  return generate(ast).code;
};
