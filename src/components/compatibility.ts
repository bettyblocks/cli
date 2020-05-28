/* eslint-disable no-param-reassign */
import {
  createArrayLiteral,
  createNodeArray,
  createObjectLiteral,
  createPropertyAssignment,
  createStatement,
  createStringLiteral,
  isCallExpression,
  isIdentifier,
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

export interface ComponentCompatibility {
  functions: string[];
  triggers: string[];
}

const isComponentCompatibility = (
  value: unknown,
): value is ComponentCompatibility => {
  if (typeof value === 'object' && value !== null) {
    const { functions, triggers } = value as ComponentCompatibility;

    if (Array.isArray(functions) && Array.isArray(triggers)) {
      return (
        functions.every(f => typeof f === 'string') &&
        triggers.every(t => typeof t === 'string')
      );
    }
  }

  return false;
};

const addCompatibility = (
  name: string,
  collection: string[],
  node: Node,
): void => {
  if (
    (isIdentifier(node) && node.getText() === name) ||
    (isPropertyAccessExpression(node) && node.getText() === `B.${name}`)
  ) {
    if (isCallExpression(node.parent)) {
      collection.push(
        node.parent
          .getChildAt(2)
          .getChildAt(0)
          .getText()
          .replace(/'/g, ''),
      );
    }
  }
};

const compatibilityTransformer = (): TransformerFactory<SourceFile> => (
  context: TransformationContext,
): Transformer<SourceFile> => {
  const functions: string[] = [];
  const triggers: string[] = [];

  const visit: Visitor = (node: Node): Node => {
    addCompatibility('defineFunction', functions, node);
    addCompatibility('triggerEvent', triggers, node); // TODO: investigate inline triggers

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

export default (code: string): ComponentCompatibility => {
  const { outputText } = transpileModule(code, {
    transformers: { before: [compatibilityTransformer()] },
  });

  const { length } = outputText;
  const component = JSON.parse(outputText.slice(1, length - 3));

  if (isComponentCompatibility(component)) {
    return component;
  }

  throw new TypeError('object is not a ComponentCompatibility');
};
