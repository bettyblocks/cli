import {
  createObjectLiteral,
  createPropertyAssignment,
  createStringLiteral,
  isArrowFunction,
  isVariableDeclaration,
  Node,
  ParameterDeclaration,
  PropertyAssignment,
  SourceFile,
  StringLiteral,
  TransformationContext,
  Transformer,
  TransformerFactory,
  transpileModule,
  TypeNode,
  visitEachChild,
  visitNode,
} from 'typescript';

enum Compatibility {
  Boolean = 'Boolean',
  Color = 'Color',
  Endpoint = 'Endpoint',
  Filter = 'Filter',
  Font = 'Font',
  Number = 'Number',
  Properties = 'Properties',
  Property = 'Property',
  Size = 'Size',
  String = 'String',
  Unit = 'Unit',
}

// TODO: support all the things!
const compatibilityLiteral = (node: TypeNode): StringLiteral => {
  const text = node.getText();

  switch (text) {
    case 'boolean': {
      return createStringLiteral(Compatibility.Boolean);
    }
    case 'number': {
      return createStringLiteral(Compatibility.Number);
    }
    case 'string': {
      return createStringLiteral(Compatibility.String);
    }
    default: {
      throw new TypeError(`unsupported type: ${text}`);
    }
  }
};

// This can be used in IDE
interface Interaction {
  name: string;
  parameters: Record<string, Compatibility>;
  type: Compatibility;
}

const createParameter = ({
  name,
  type,
}: ParameterDeclaration): PropertyAssignment => {
  const text = name.getText();

  if (typeof type === 'undefined') {
    throw new TypeError(`type of parameter ${text} is undefined`);
  }

  return createPropertyAssignment(
    createStringLiteral(text),
    compatibilityLiteral(type),
  );
};

const compatibilityTransformer = (): TransformerFactory<SourceFile> => (
  context: TransformationContext,
): Transformer<SourceFile> => {
  const visit = (node: Node): Node => {
    if (isVariableDeclaration(node)) {
      const { initializer, name: nameNode } = node;
      const name = nameNode.getText();

      if (typeof initializer === 'undefined') {
        throw new TypeError(`definition of ${name} lacks an expression`);
      }

      if (!isArrowFunction(initializer)) {
        throw new TypeError(`expression of ${name} is not an arrow function`);
      }

      const { parameters, type } = initializer;

      if (typeof type === 'undefined') {
        throw new TypeError(`return type of ${name} is undefined`);
      }

      node.initializer = createObjectLiteral([
        createPropertyAssignment(
          createStringLiteral('name'),
          createStringLiteral(name),
        ),
        createPropertyAssignment(
          createStringLiteral('parameters'),
          createObjectLiteral(parameters.map(createParameter)),
        ),
        createPropertyAssignment(
          createStringLiteral('type'),
          compatibilityLiteral(type),
        ),
      ]);

      return node;
    }

    return visitEachChild(node, visit, context);
  };

  return (node: SourceFile): SourceFile => visitNode(node, visit);
};

export const transpile = (code: string): string => {
  const { outputText } = transpileModule(code, {
    transformers: { before: [compatibilityTransformer()] },
  });

  return outputText;
};
