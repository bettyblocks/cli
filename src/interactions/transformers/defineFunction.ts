/* eslint-disable no-param-reassign */

import {
  createIdentifier,
  isPropertyAccessExpression,
  Node,
  SourceFile,
  TransformationContext,
  Transformer,
  TransformerFactory,
  visitEachChild,
  visitNode,
  Visitor,
} from 'typescript';

export default (): TransformerFactory<SourceFile> => (
  context: TransformationContext,
): Transformer<SourceFile> => {
  const visit: Visitor = (node: Node): Node => {
    if (
      isPropertyAccessExpression(node) &&
      node.getText() === 'B.defineFunction'
    ) {
      node = createIdentifier('defineFunction');
    }

    return visitEachChild(node, visit, context);
  };

  return (node: SourceFile): SourceFile => visitNode(node, visit);
};
