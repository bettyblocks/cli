/* eslint-disable no-param-reassign */
import {
  createNodeArray,
  createObjectLiteral,
  createPropertyAssignment,
  createExpressionStatement,
  createStringLiteral,
  ExpressionStatement,
  isFunctionDeclaration,
  isSourceFile,
  Node,
  NodeArray,
  ParameterDeclaration,
  PropertyAssignment,
  SourceFile,
  StringLiteral,
  Transformer,
  TransformerFactory,
  transpileModule,
  TypeNode,
  visitNode,
  ModuleKind,
} from 'typescript';

import { InteractionCompatibility, InteractionOptionType } from '../types';

const compatibilityValues: InteractionOptionType[] = [
  InteractionOptionType.Boolean,
  InteractionOptionType.Number,
  InteractionOptionType.String,
  InteractionOptionType.Event,
  InteractionOptionType.Void,
  InteractionOptionType.Page,
];

const isInteractionOptionType = (
  value: unknown,
): value is InteractionOptionType =>
  typeof value === 'string' &&
  compatibilityValues.includes(value as InteractionOptionType);

const isParameters = (value: unknown): boolean => {
  if (typeof value === 'object' && value !== null) {
    const names = Object.keys(value);
    const types = Object.values(value);

    return (
      names.every((name: unknown): boolean => typeof name === 'string') &&
      types.every(isInteractionOptionType)
    );
  }

  return false;
};

const isInteraction = (value: unknown): value is InteractionCompatibility => {
  if (typeof value === 'object' && value !== null) {
    const { name, parameters, type } = value as InteractionCompatibility;

    return (
      typeof name === 'string' &&
      isParameters(parameters) &&
      isInteractionOptionType(type)
    );
  }

  return false;
};

const compatibilityLiteral = (node: TypeNode): StringLiteral => {
  const text = node.getText();

  switch (text) {
    case 'boolean': {
      return createStringLiteral(InteractionOptionType.Boolean);
    }
    case 'number': {
      return createStringLiteral(InteractionOptionType.Number);
    }
    case 'string': {
      return createStringLiteral(InteractionOptionType.String);
    }

    case 'void': {
      return createStringLiteral(InteractionOptionType.Void);
    }

    case 'Page': {
      return createStringLiteral(InteractionOptionType.Page);
    }

    default: {
      throw new TypeError(`unsupported type: ${text}`);
    }
  }
};

interface TypeDefinition {
  name: Node;
  type: Node;
}

const createParameter = ({
  name,
  type,
}: TypeDefinition): PropertyAssignment => {
  const text = name.getText();

  if (typeof type === 'undefined') {
    throw new TypeError(`typeof ${text} is undefined`);
  }

  return createPropertyAssignment(
    createStringLiteral(text),
    compatibilityLiteral(type as TypeNode),
  );
};

const parseParameters = ({
  name,
  type,
}: ParameterDeclaration): PropertyAssignment[] => {
  if (typeof type === 'undefined' && typeof name === 'undefined') {
    return [];
  }

  if (typeof type === 'undefined') {
    throw new TypeError(`type of parameter ${name.getText()} is undefined`);
  }

  const namedParameters: string[] = [];
  const types: TypeDefinition[] = [];

  name.forEachChild(child =>
    child.getChildren().forEach(param => namedParameters.push(param.getText())),
  );

  type.forEachChild(child => {
    const [childName, , childType] = child.getChildren();
    types.push({
      name: childName,
      type: childType,
    });
  });

  const typeDefinitions: PropertyAssignment[] = [];

  type.forEachChild(child => {
    const [childName, , childType] = child.getChildren();
    if (childType.getText() !== 'Event') {
      typeDefinitions[typeDefinitions.length] = createParameter({
        name: childName,
        type: childType,
      });
    }
  });

  return typeDefinitions;
};

const generateCompatibility = (
  name: string,
  type: TypeNode,
  parameters: ParameterDeclaration,
): NodeArray<ExpressionStatement> =>
  createNodeArray([
    createExpressionStatement(
      createObjectLiteral([
        createPropertyAssignment(
          createStringLiteral('name'),
          createStringLiteral(name),
        ),
        createPropertyAssignment(
          createStringLiteral('parameters'),
          createObjectLiteral(parseParameters(parameters)),
        ),
        createPropertyAssignment(
          createStringLiteral('type'),
          compatibilityLiteral(type),
        ),
      ]),
    ),
  ]);

const compatibilityTransformer = (): TransformerFactory<
  SourceFile
> => (): Transformer<SourceFile> => (sourceFile: SourceFile): SourceFile =>
  visitNode(
    sourceFile,
    (node: Node): Node => {
      if (isSourceFile(node)) {
        const { statements } = node;
        const [statement] = statements.filter(isFunctionDeclaration);

        if (statements.length === 0) {
          throw new RangeError('file does not contain an interaction');
        }

        if (statements.length > 2) {
          throw new RangeError('file contains multiple statements');
        }

        if (statement && isFunctionDeclaration(statement)) {
          const { parameters, type, name: nameNode } = statement;

          if (parameters.length > 1) {
            throw new TypeError(
              `function statement has too many parameters, expected 0 or 1 but received ${parameters.length}`,
            );
          }

          if (typeof nameNode === 'undefined') {
            throw new TypeError(`function name indentifier is not defined`);
          }

          const name = nameNode.getText();

          if (typeof type === 'undefined') {
            throw new TypeError(`return type of ${name} is undefined`);
          }

          const newStatements = generateCompatibility(
            name,
            type,
            parameters[0] || {},
          );

          node.statements = newStatements;
          return node;
        }
      }

      throw new TypeError(`
expected expression of the kind
  function interaction({ event, argument }: { event: Event, argument: ArgumentType }): ReturnType {
    // body
  }
`);
    },
  );
export default (code: string): InteractionCompatibility => {
  const result = transpileModule(code, {
    transformers: { before: [compatibilityTransformer()] },
    compilerOptions: { module: ModuleKind.CommonJS },
  });

  const { outputText } = result;

  const matches = outputText.match(/(\{\s"name".+\})/g);

  if (!matches) throw new Error('this is impossible');

  const [metaData] = matches;

  const interaction = JSON.parse(metaData);

  if (isInteraction(interaction)) {
    return interaction;
  }

  throw new TypeError('object is not an Interaction');
};
