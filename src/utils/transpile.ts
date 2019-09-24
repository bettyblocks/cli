import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { stringLiteral, File } from '@babel/types';

export default (code: string): string | void => {
  try {
    const ast: File = parse(code, {
      plugins: ['jsx'],
    });

    traverse(ast, {
      // tslint:disable-next-line: function-name
      ObjectProperty(path) {
        if (['jsx', 'styles'].includes(path.node.key.name)) {
          const value: string = generate(path.node.value).code;

          path.node.value = stringLiteral(value);
        }
      },
    });

    return generate(ast).code;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
