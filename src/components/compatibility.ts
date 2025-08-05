import type {
  Node,
  SourceFile,
  TransformationContext,
  Transformer,
  TransformerFactory,
  Visitor,
} from 'typescript';

import {
  isCallExpression,
  isIdentifier,
  isMethodDeclaration,
  isPropertyAccessExpression,
  isSourceFile,
  transpileModule,
  visitEachChild,
  visitNode,
} from 'typescript';

import {
  walkCompilerAstAndFindComments,
  createLiteralObjectExpression,
} from './comments';

export interface ComponentCompatibility {
  functions: string[];
  triggers: string[];
  interactions: object;
}

const isComponentCompatibility = (
  value: unknown,
): value is ComponentCompatibility => {
  if (typeof value === 'object' && value !== null) {
    const { functions, triggers } = value as ComponentCompatibility;

    if (Array.isArray(functions) && Array.isArray(triggers)) {
      return (
        functions.every((f) => typeof f === 'string') &&
        triggers.every((t) => typeof t === 'string')
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
    (isPropertyAccessExpression(node) &&
      (node.getText() === `B.${name}` || node.getText() === `.${name}`))
  ) {
    if (isCallExpression(node.parent)) {
      collection.push(
        node.parent.getChildAt(2).getChildAt(0).getText().replace(/'/g, ''),
      );
    }
    if (isMethodDeclaration(node.parent)) {
      collection.push(
        node.parent.getChildAt(2).getChildAt(1).getText().replace(/'/g, ''),
      );
    }
  }
};

const compatibilityTransformer =
  (): TransformerFactory<SourceFile> =>
  (context: TransformationContext): Transformer<SourceFile> => {
    const functions: string[] = [];
    const triggers: string[] = [];
    const comments: object[] = [];
    const {
      createArrayLiteralExpression,
      createExpressionStatement,
      createObjectLiteralExpression,
      createPropertyAssignment,
      createStringLiteral,
      updateSourceFile,
    } = context.factory;

    const visit: Visitor = (node: Node): Node => {
      addCompatibility('defineFunction', functions, node);
      addCompatibility('triggerEvent', triggers, node); // TODO: investigate inline triggers

      return visitEachChild(node, visit, context);
    };

    return (node: SourceFile): SourceFile => {
      visitNode(node, visit);
      walkCompilerAstAndFindComments(node, comments);

      if (isSourceFile(node)) {
        return updateSourceFile(node, [
          createExpressionStatement(
            createObjectLiteralExpression([
              createPropertyAssignment(
                createStringLiteral('functions'),
                createArrayLiteralExpression(
                  functions.map((n) => createStringLiteral(n)),
                ),
              ),
              createPropertyAssignment(
                createStringLiteral('triggers'),
                createArrayLiteralExpression(
                  triggers.map((n) => createStringLiteral(n)),
                ),
              ),
              createPropertyAssignment(
                createStringLiteral('interactions'),
                createObjectLiteralExpression(
                  createLiteralObjectExpression(comments),
                ),
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const component = JSON.parse(
    outputText.replace(/^[^{]+/, '').replace(/[^}]+$/, ''),
  );

  if (isComponentCompatibility(component)) {
    return component;
  }

  throw new TypeError('object is not a ComponentCompatibility');
};
