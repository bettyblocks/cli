/* eslint-disable no-param-reassign */
import {
  createArrayLiteral,
  createNodeArray,
  createObjectLiteral,
  createPropertyAssignment,
  createStatement,
  createStringLiteral,
  isPropertyAccessExpression,
  isSourceFile,
  Node,
  SourceFile,
  TransformationContext,
  Transformer,
  TransformerFactory,
  transpileModule,
  visitEachChild,
  visitNode,
  Visitor,
} from 'typescript';

export interface Component {
  functions: string[];
  triggers: string[];
}

const isComponent = (value: unknown): value is Component => {
  if (typeof value === 'object' && value !== null) {
    const { functions, triggers } = value as Component;

    if (Array.isArray(functions) && Array.isArray(triggers)) {
      return (
        functions.every(f => typeof f === 'string') &&
        triggers.every(t => typeof t === 'string')
      );
    }
  }

  return false;
};

const compatibilityTransformer = (): TransformerFactory<SourceFile> => (
  context: TransformationContext,
): Transformer<SourceFile> => {
  const functions: string[] = [];
  const triggers: string[] = [];

  const visit: Visitor = (node: Node): Node => {
    if (
      isPropertyAccessExpression(node) &&
      node.getText() === 'B.defineFunction'
    ) {
      const name = node.parent
        .getChildAt(2)
        .getChildAt(0)
        .getText();
      functions.push(name.replace(/'/g, ''));
    }

    if (
      isPropertyAccessExpression(node) &&
      node.getText() === 'B.triggerEvent'
    ) {
      const name = node.parent
        .getChildAt(2)
        .getChildAt(0)
        .getText();
      triggers.push(name.replace(/'/g, ''));
    }

    return visitEachChild(node, visit, context);
  };

  return (node: SourceFile): SourceFile => {
    visitNode(node, visit);

    if (isSourceFile(node)) {
      node.statements = createNodeArray([
        createStatement(
          createObjectLiteral([
            createPropertyAssignment(
              createStringLiteral('functions'),
              createArrayLiteral(functions.map(n => createStringLiteral(n))),
            ),
            createPropertyAssignment(
              createStringLiteral('triggers'),
              createArrayLiteral(triggers.map(n => createStringLiteral(n))),
            ),
          ]),
        ),
      ]);
    }

    return node;
  };
};

export default (code: string): Component => {
  const { outputText } = transpileModule(code, {
    transformers: { before: [compatibilityTransformer()] },
  });

  const { length } = outputText;
  const component = JSON.parse(outputText.slice(1, length - 3));

  if (isComponent(component)) {
    return component;
  }

  throw new TypeError('object is not a Component');
};
