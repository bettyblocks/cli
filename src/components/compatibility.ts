import {
  isCallExpression,
  isIdentifier,
  isMethodDeclaration,
  isPropertyAccessExpression,
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

import { walkCompilerAstAndFindComments } from './comments';

export interface ComponentCompatibility {
  functions: string[];
  triggers: string[];
  interactions: Record<string, unknown>;
}

function generateComponentCompatibility(code: string): ComponentCompatibility {
  const componentCompatibility: ComponentCompatibility = {
    functions: [],
    triggers: [],
    interactions: {},
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
          node.parent
            .getChildAt(2)
            .getChildAt(0)
            .getText()
            .replace(/'/g, ''),
        );
      }
      if (isMethodDeclaration(node.parent)) {
        collection.push(
          node.parent
            .getChildAt(2)
            .getChildAt(1)
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
    const comments: object[] = [];

    const visit: Visitor = (node: Node): Node => {
      addCompatibility('defineFunction', functions, node);
      addCompatibility('triggerEvent', triggers, node); // TODO: investigate inline triggers

      return visitEachChild(node, visit, context);
    };

    return (node: SourceFile): SourceFile => {
      visitNode(node, visit);
      walkCompilerAstAndFindComments(node, comments);

      componentCompatibility.functions = [
        ...componentCompatibility.functions,
        ...functions,
      ];

      componentCompatibility.triggers = [
        ...componentCompatibility.triggers,
        ...triggers,
      ];

      componentCompatibility.interactions = {
        ...componentCompatibility.interactions,
        ...comments.reduce((acc, comment) => {
          const [[key, value]] = Object.entries(comment);
          return {
            ...acc,
            [key]: value,
          };
        }, {}),
      };

      return node;
    };
  };

  transpileModule(code, {
    transformers: { before: [compatibilityTransformer()] },
  });

  return componentCompatibility;
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

export default (code: string): ComponentCompatibility => {
  const componentCompatibility = generateComponentCompatibility(code);

  if (isComponentCompatibility(componentCompatibility)) {
    return componentCompatibility;
  }

  throw new TypeError('object is not a ComponentCompatibility');
};
