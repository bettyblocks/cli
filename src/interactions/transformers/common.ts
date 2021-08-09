/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */

import {
  createArrowFunction,
  createBlock,
  createCall,
  createIdentifier,
  createJsxAttribute,
  createJsxExpression,
  createParameter,
  createParen,
  createReturn,
  createStatement,
  createVariableDeclaration,
  createVariableStatement,
  CustomTransformerFactory,
  Expression,
  Identifier,
  isIdentifier,
  isJsxAttribute,
  isJsxExpression,
  isJsxOpeningElement,
  isJsxSelfClosingElement,
  isOmittedExpression,
  isStringLiteral,
  JsxAttribute,
  JsxAttributeLike,
  JsxAttributes,
  JsxExpression,
  JsxOpeningElement,
  JsxSelfClosingElement,
  Node,
  NodeArray,
  ParameterDeclaration,
  SourceFile,
  Statement,
  TransformationContext,
  Transformer,
  TransformerFactory,
  updateJsxAttributes,
  updateJsxOpeningElement,
  updateJsxSelfClosingElement,
  visitEachChild,
  visitNode,
  Visitor,
} from 'typescript';

import {
  ComponentInteraction,
  isCustomInteraction,
  isGlobalInteraction,
  isLoginInteraction,
  isSpecialEvent,
  isToggleInteraction,
  Parameter,
} from '../../repo';

const EVENT_PARAMETER_NAME = 'e';

const HEX_CHARACTERS = '0123456789abcdef';

export type Factory = TransformerFactory<SourceFile> | CustomTransformerFactory;

export type EligibleJsxElement = JsxOpeningElement | JsxSelfClosingElement;

export type FunctionCallConfig = {
  name: string;
  arguments?: string[];
};

export const randomHexCharacter = (): string => {
  const randomNumber = Math.random();
  const randomIndex = Math.round(16 * randomNumber);

  return HEX_CHARACTERS[randomIndex];
};

export const randomVariableName = (): string => {
  const variableName = [];

  for (let i = 0; i < 16; i += 1) {
    variableName.push(randomHexCharacter());
  }

  return `variable_${variableName.join('')}`;
};

export const nub = <T>(array: T[]): T[] => Array.from(new Set(array));

/*
  Update attributes of JSX opening or self closing element
*/
export const updateEligibleJsxElementAttributes = (
  node: EligibleJsxElement,
  attributes: JsxAttributes,
): EligibleJsxElement =>
  isJsxOpeningElement(node)
    ? updateJsxOpeningElement(node, node.tagName, [], attributes)
    : updateJsxSelfClosingElement(node, node.tagName, [], attributes);

/*
  Get JSX attribute by name
*/
export const getJsxAttribute = (
  handlerName: string,
  { attributes: { properties } }: EligibleJsxElement,
): JsxAttribute | null => {
  const matches = properties.filter(
    (attributeLike: JsxAttributeLike): boolean =>
      isJsxAttribute(attributeLike) &&
      attributeLike.name.escapedText === handlerName,
  );

  return matches.length ? (matches[0] as JsxAttribute) : null;
};

/*
  Create parameters based on parameter names
*/
export const createParameters = (
  parameterNames: string[],
): ParameterDeclaration[] =>
  parameterNames.map(
    (parameterName: string): ParameterDeclaration =>
      createParameter([], [], undefined, createIdentifier(parameterName)),
  );

/*
  Add parameters to existing parameter list based on parameter names
*/
export const addParameters = (
  parameterNames: string[],
  parameters: NodeArray<ParameterDeclaration>,
): ParameterDeclaration[] => [
  ...parameters,
  ...createParameters(
    parameterNames.filter(
      (parameterName: string): boolean =>
        !parameters.some(
          (parameter: ParameterDeclaration): boolean =>
            isIdentifier(parameter.name) &&
            parameter.name.escapedText === parameterName,
        ),
    ),
  ),
];

/*
  Create an event listener attribute with a linked handler for a JSX element
  onClick={ () => { handler(); } }
*/
export const createHandler = ({
  statements,
  handlerName,
  parameterNames,
}: {
  statements: Statement[];
  handlerName: string;
  parameterNames: string[];
}): JsxAttribute =>
  createJsxAttribute(
    createIdentifier(handlerName),
    createJsxExpression(
      undefined,
      createArrowFunction(
        [],
        [],
        createParameters([
          ...new Set([EVENT_PARAMETER_NAME, ...parameterNames]),
        ]),
        undefined,
        undefined,
        createBlock(statements),
      ),
    ),
  );

/*
  Create a list of function calls based on a list of function names
*/
export const createCalls = (functions: FunctionCallConfig[]): Statement[] =>
  functions.map(
    (config: FunctionCallConfig): Statement =>
      createStatement(
        createCall(
          createIdentifier(config.name),
          [],
          config.arguments
            ? config.arguments.map(
                (arg: string): Identifier => createIdentifier(arg),
              )
            : [],
        ),
      ),
  );

/*
  Add an event listener attribute with a linked handler to a JSX element
  that doesn't already have a matching attribute yet (e.g. onClick)
*/
export const newJsxAttribute = ({
  functions,
  handlerName,
  node,
  parameterNames,
}: {
  functions: FunctionCallConfig[];
  handlerName: string;
  node: EligibleJsxElement;
  parameterNames: string[];
}): EligibleJsxElement => {
  node.attributes = updateJsxAttributes(node.attributes, [
    ...node.attributes.properties,
    createHandler({
      statements: createCalls(functions),
      handlerName,
      parameterNames,
    }),
  ]);

  return node;
};

/*
  Check if value of a JSX attribute is a string literal
*/
export const isStringLiteralJsxAttribute = ({
  initializer,
}: JsxAttribute): boolean =>
  typeof initializer !== 'undefined' && isStringLiteral(initializer);

/*
  Check if the body of a JSX attribute is omitted
*/
export const isOmittedJsxAttribute = ({ initializer }: JsxAttribute): boolean =>
  typeof initializer !== 'undefined' &&
  isJsxExpression(initializer) &&
  typeof initializer.expression !== 'undefined' &&
  isOmittedExpression(initializer.expression);

/*
  Replace an existing matching event listener attribute on a JSX element (e.g. onClick)
  by a new event listener attribute with a linked handler (custom, toggle, login, ...)

  In case of <div onClick={}> or <div onClick="bla">
*/
export const overwriteJsxAttribute = ({
  functions,
  handlerName,
  node,
  parameterNames,
}: {
  functions: FunctionCallConfig[];
  handlerName: string;
  node: EligibleJsxElement;
  parameterNames: string[];
}): EligibleJsxElement => {
  const attributes = updateJsxAttributes(
    node.attributes,
    node.attributes.properties.map(
      (attributeLike: JsxAttributeLike): JsxAttributeLike =>
        isJsxAttribute(attributeLike) &&
        attributeLike.name.escapedText === handlerName
          ? createHandler({
              statements: createCalls(functions),
              handlerName,
              parameterNames,
            })
          : attributeLike,
    ),
  );

  return updateEligibleJsxElementAttributes(node, attributes);
};

/*
  Combine existing function calls with calls to interaction handlers
*/
export const wrapExpression = ({
  expression,
  functions,
  variableNameGenerator,
}: {
  expression: Expression;
  functions: FunctionCallConfig[];
  variableNameGenerator: () => string;
}): Statement[] => {
  const variableName = variableNameGenerator();

  const declaration = createVariableStatement(undefined, [
    createVariableDeclaration(
      variableName,
      undefined,
      createCall(
        createParen(expression),
        [],
        [createIdentifier(EVENT_PARAMETER_NAME)],
      ),
    ),
  ]);

  const calls = createCalls(functions);

  const returnStatement = createReturn(createIdentifier(variableName));

  return [declaration, ...calls, returnStatement];
};

/*
  Combine an existing matching event listener attribute on a JSX element (e.g. onClick)
  with another event listener attribute linked to a handler (custom, toggle, login, ...)

  Cases:
  <div onClick={f}>
  <div onClick={() => {}}>
  <div onClick={() => f()}>
  <div onClick={f.bind(this, a)}>
  <div onClick={() => { var f = o.f(a); return g(); }}>
*/
export const wrapJsxAttribute = ({
  functions,
  handlerName,
  node,
  variableNameGenerator = randomVariableName,
}: {
  functions: FunctionCallConfig[];
  handlerName: string;
  node: EligibleJsxElement;
  variableNameGenerator?: () => string;
}): EligibleJsxElement => {
  const attributes = updateJsxAttributes(
    node.attributes,
    node.attributes.properties.map(
      (attributeLike: JsxAttributeLike): JsxAttributeLike => {
        if (
          isJsxAttribute(attributeLike) &&
          attributeLike.name.escapedText === handlerName
        ) {
          const initializer: JsxExpression = attributeLike.initializer as JsxExpression;
          const expression: Expression = initializer.expression as Expression;

          return createHandler({
            statements: wrapExpression({
              expression,
              functions,
              variableNameGenerator,
            }),
            handlerName,
            parameterNames: [EVENT_PARAMETER_NAME],
          });
        }

        return attributeLike;
      },
    ),
  );

  return updateEligibleJsxElementAttributes(node, attributes);
};

/*
  Add an event listener attribute with a linked handler to a JSX element
*/
export const addCallToHandler = (options: {
  functions: FunctionCallConfig[];
  handlerName: string;
  node: EligibleJsxElement;
  parameterNames: string[];
  variableNameGenerator?: () => string;
}): EligibleJsxElement => {
  const { handlerName, node } = options;

  const attribute = getJsxAttribute(handlerName, node);

  /*

  No matching JsxAttribute

  <div>
  becomes
  <div onClick={() => { foo(); }}>

  */
  if (attribute === null) {
    return newJsxAttribute(options);
  }

  /*

  StringLiteral

  <div onClick="bar">
  becomes
  <div onClick={() => { foo(); }}>

  Omitted

  <div onClick={}>
  becomes
  <div onClick={() => { foo(); }}>

  */
  if (
    isStringLiteralJsxAttribute(attribute) ||
    isOmittedJsxAttribute(attribute)
  ) {
    return overwriteJsxAttribute(options);
  }

  /*

  Literal

  <div onClick={bar}>`
  becomes
  <div onClick={e => { const variable_123 = (() => { bar(); })(e); foo(); return variable_123; }}>

  ArrowFunction with empty Block

  <div onClick={() => { }}>`
  becomes
  <div onClick={e => { const variable_123 = (() => { })(e); foo(); return variable_123; }}>

  ArrowFunction with multiple Statements

  <div onClick={() => { var foo = bar.baz(1, 2, 3); return quux(); }}>`
  becomes
  <div onClick={e => { const variable_123 = (() => { var foo = bar.baz(1, 2, 3); return quux(); })(e); foo(); return variable_123; }}>

  ArrowFunction with single Call

  <div onClick={() => bar()}>`
  becomes
  <div onClick={e => { const variable_123 = (() => bar())(e); foo(); return variable_123; }}>

  Bind call

  <div onClick={bar.bind(this, 1, 2)}>`
  becomes
  <div onClick={e => { const variable_123 = (bar.bind(this, 1, 2))(e); foo(); return variable_123; }}>

  */
  return wrapJsxAttribute(options);
};

/*
  Get an interaction handler name based on a source event
*/
export const eventToHandlerName = (event: string): string => `on${event}`;

/*
  Transform the first match (node) in the AST tree based on a predicate
*/
export const visitFirstMatch = (
  predicate: (node: Node) => boolean,
  transform: (node: EligibleJsxElement) => EligibleJsxElement,
): TransformerFactory<SourceFile> => (
  context: TransformationContext,
): Transformer<SourceFile> => {
  let interactionApplied = false;

  const visit: Visitor = (node: Node): Node => {
    if (!interactionApplied && predicate(node)) {
      interactionApplied = true;

      return transform(node as EligibleJsxElement);
    }

    return visitEachChild(node, visit, context);
  };

  return (node: SourceFile): SourceFile => visitNode(node, visit);
};

/*
  Transform the root element of the DOM tree:
  The first JsxOpeningElement (<div>) or JsxSelfClosingElement (<div />)
*/
export const visitFirstEligibleJsxElement = (
  transform: (node: EligibleJsxElement) => EligibleJsxElement,
): TransformerFactory<SourceFile> =>
  visitFirstMatch(
    (node: Node): boolean =>
      isJsxOpeningElement(node) || isJsxSelfClosingElement(node),
    transform,
  );

/*
  Check if an element is an <Action /> component
*/
export const isActionComponent = ({ tagName }: EligibleJsxElement): boolean =>
  isIdentifier(tagName) && tagName.escapedText === 'Action';

export const visitFirstActionComponent = (
  transform: (node: EligibleJsxElement) => EligibleJsxElement,
): TransformerFactory<SourceFile> =>
  visitFirstMatch(
    (node: Node): boolean =>
      (isJsxOpeningElement(node) || isJsxSelfClosingElement(node)) &&
      isActionComponent(node),
    transform,
  );

/*
  Add an event listener attribute to a JSX element, linked to a interaction handler
*/
export const addHandler = ({
  functions,
  ...options
}: {
  functions: FunctionCallConfig[];
  handlerName: string;
  parameterNames: string[];
}): Factory =>
  visitFirstEligibleJsxElement(
    (node: EligibleJsxElement): EligibleJsxElement =>
      addCallToHandler({
        functions,
        node,
        ...options,
      }),
  );

/*
  Add an event listener attribute to a JSX element, linked to a general handler
*/
export const transformGeneral = ({
  functionNames,
  id,
  callName,
  callArguments,
  ...options
}: {
  functionNames: string[];
  handlerName: string;
  parameterNames: string[];
  id: string;
  callName: string;
  callArguments: string[];
}): Factory =>
  addHandler({
    functions: [
      ...functionNames.map((name: string) => ({
        name,
      })),
      {
        name: `${callName}${id}`,
        arguments: callArguments,
      },
    ],
    ...options,
  });

/*
  Add an event listener attribute to a JSX element, linked to a custom handler
*/
export const transformCustom = ({
  id,
  functionNames,
  ...options
}: {
  id: string;
  functionNames: string[];
  handlerName: string;
  parameterNames: string[];
}): Factory =>
  transformGeneral({
    id,
    functionNames,
    callName: 'customFunctionCall',
    callArguments: ['null', EVENT_PARAMETER_NAME],
    ...options,
  });

/*
  Add an event listener attribute to a JSX element, linked to a global handler
*/
export const transformGlobal = ({
  id,
  functionNames,
  ...options
}: {
  id: string;
  functionNames: string[];
  parameters: Parameter[];
  handlerName: string;
  parameterNames: string[];
}): Factory =>
  transformGeneral({
    id,
    functionNames,
    callName: 'globalFunctionCall',
    callArguments: ['null', EVENT_PARAMETER_NAME],
    ...options,
  });

/*
  Add an event listener attribute to a JSX element linked to a toggle handler
*/
export const transformToggle = ({
  functionNames,
  id,
  ...options
}: {
  functionNames: string[];
  handlerName: string;
  id: string;
  parameterNames: string[];
}): Factory =>
  addHandler({
    functions: [...functionNames, `sourceInteraction${id}`].map(
      (name: string) => ({
        name,
      }),
    ),
    ...options,
  });

/*
  Add an event listener attribute to a JSX element linked to a login handler
*/
export const transformLogin = ({ id }: { id: string }): Factory =>
  visitFirstActionComponent(
    (node: EligibleJsxElement): EligibleJsxElement => {
      node.attributes = updateJsxAttributes(node.attributes, [
        ...node.attributes.properties,
        createJsxAttribute(
          createIdentifier('loginInteraction'),
          createJsxExpression(
            undefined,
            createIdentifier(`loginInteraction${id}`),
          ),
        ),
      ]);

      return node;
    },
  );

export const transformSpecialEvent = (
  interaction: ComponentInteraction,
): Factory => {
  const { id, type, configuration } = interaction;
  const { sourceEvent } = configuration;
  const isSubmitEvent = sourceEvent === 'Submit';

  const handlerData = {
    id,
    functionNames: isSubmitEvent ? ['e.preventDefault'] : [],
    handlerName: eventToHandlerName(sourceEvent),
    parameterNames: isSubmitEvent ? ['e'] : [],
  };

  if (isCustomInteraction(interaction)) {
    return transformCustom(handlerData);
  }

  if (isGlobalInteraction(interaction)) {
    return transformGlobal({
      ...handlerData,
      parameters: interaction.configuration.parameters,
    });
  }

  if (isLoginInteraction(interaction)) {
    return transformLogin(handlerData);
  }

  if (isToggleInteraction(interaction)) {
    return transformToggle(handlerData);
  }

  throw Error(`Interaction of type '${type}' is not implemented`);
};

/*
  Create transformers for the TypeScript transpiler based on source interactions
*/
export const assembleTransformers = (
  sourceInteractions: ComponentInteraction[],
): Factory[] =>
  sourceInteractions
    .filter(
      ({ configuration: { sourceEvent } }: ComponentInteraction): boolean =>
        isSpecialEvent(sourceEvent),
    )
    .map(transformSpecialEvent);
