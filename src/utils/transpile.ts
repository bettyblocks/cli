import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { stringLiteral, File } from '@babel/types';

const generateInnerCode: (ast: File) => void = (ast: File): void => {
  traverse(ast, {
    // tslint:disable-next-line: function-name
    ObjectProperty(path) {
      if (['jsx', 'styles'].includes(path.node.key.name)) {
        const value: string = generate(path.node.value).code;

        // Reassigningment is how this kind of traversal works
        // eslint-disable-next-line no-param-reassign
        path.node.value = stringLiteral(value);
      }
    },
  });
};

export default (code: string): string | void => {
  try {
    const ast: File = parse(code, {
      plugins: ['jsx'],
    });

    generateInnerCode(ast);

    return generate(ast).code;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
