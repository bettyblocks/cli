import {
  CustomTransformerFactory,
  Expression,
  Identifier,
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
  Visitor,
  factory,
  isIdentifier,
  isJsxAttribute,
  isJsxExpression,
  isJsxOpeningElement,
  isJsxSelfClosingElement,
  isOmittedExpression,
  isStringLiteral,
  visitEachChild,
  visitNode,
} from 'typescript';

const {
  createArrowFunction,
  createBlock,
  createCallExpression,
  createExpressionStatement,
  createIdentifier,
  createJsxAttribute,
  createJsxExpression,
  createParameterDeclaration,
  createParenthesizedExpression,
  createReturnStatement,
  createVariableDeclaration,
  createVariableStatement,
  updateJsxAttributes,
  updateJsxOpeningElement,
  updateJsxSelfClosingElement,
} = factory;

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
      createParameterDeclaration(
        [],
        [],
        undefined,
        createIdentifier(parameterName),
      ),
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
}: {
  statements: Statement[];
  handlerName: string;
}): JsxAttribute =>
  createJsxAttribute(
    createIdentifier(handlerName),
    createJsxExpression(
      undefined,
      createArrowFunction(
        [],
        [],
        createParameters([...new Set([EVENT_PARAMETER_NAME])]),
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
      createExpressionStatement(
        createCallExpression(
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
}: {
  functions: FunctionCallConfig[];
  handlerName: string;
  node: EligibleJsxElement;
}): EligibleJsxElement => {
  return updateEligibleJsxElementAttributes(
    node,
    updateJsxAttributes(node.attributes, [
      ...node.attributes.properties,
      createHandler({
        statements: createCalls(functions),
        handlerName,
      }),
    ]),
  );
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
}: {
  functions: FunctionCallConfig[];
  handlerName: string;
  node: EligibleJsxElement;
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
      undefined,
      createCallExpression(
        createParenthesizedExpression(expression),
        [],
        [createIdentifier(EVENT_PARAMETER_NAME)],
      ),
    ),
  ]);

  const calls = createCalls(functions);

  const returnStatement = createReturnStatement(createIdentifier(variableName));

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
  node: EligibleJsxElement;
  handlerName: string;
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
  Add an event listener attribute to a JSX element, linked to a interaction handler
*/
export const addHandler = ({
  functions,
  handlerName,
}: {
  functions: FunctionCallConfig[];
  handlerName: string;
}): Factory =>
  visitFirstEligibleJsxElement(
    (node: EligibleJsxElement): EligibleJsxElement =>
      addCallToHandler({
        functions,
        handlerName,
        node,
      }),
  );

/*
  Add an event listener attribute to a JSX element, linked to a general handler
*/
export const transformGeneral = ({
  callName,
  callArguments,
  handlerName,
}: {
  callName: string;
  callArguments: string[];
  handlerName: string;
}): Factory =>
  addHandler({
    functions: [
      {
        name: `${callName}`,
        arguments: callArguments,
      },
    ],
    handlerName,
  });

/*
  Add an event listener attribute to a JSX element, linked to a custom handler
*/
export const transformCustom = ({ event }: { event: string }): Factory =>
  transformGeneral({
    callName: 'B.triggerEvent',
    callArguments: [`"${event}"`, EVENT_PARAMETER_NAME],
    handlerName: event,
  });

export const transformSpecialEvent = (event: string): Factory => {
  const handlerData = {
    event,
  };

  return transformCustom(handlerData);
};

/*
  Create transformers for the TypeScript transpiler based on events to be injected
*/
export const assembleTransformers = (events: string[]): Factory[] =>
  events.map(transformSpecialEvent);
