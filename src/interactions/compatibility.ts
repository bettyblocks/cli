import * as ts from 'typescript';
import path from 'path';
import Case from 'case';
import { Interaction, InteractionOptionType } from '../types';

const allowedTypes = [
  'boolean',
  'Event',
  'Locale',
  'number',
  'Page',
  'string',
  'void',
];

export default (filename: string): Interaction => {
  const program = ts.createProgram([filename], {});
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filename);

  if (!sourceFile) throw new Error(`Something went wrong reading ${filename}`);

  const interactionName = Case.camel(
    path.basename(filename).replace(/.ts/, ''),
  );

  const interaction: Partial<Interaction> = {};

  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node)) {
      const functionName = node.name ? node.name.text : '';

      if (functionName !== interactionName) {
        throw new RangeError(
          'Function name does not match file name or file contains multiple function declarations',
        );
      }

      interaction.name = functionName;
      interaction.parameters = {};

      const typeNode = node.type;
      if (!typeNode) {
        throw new Error(`Missing return type for ${interactionName}`);
      }

      const returnType = typeChecker.typeToString(
        typeChecker.getTypeFromTypeNode(typeNode),
      );

      interaction.type = Case.pascal(returnType) as InteractionOptionType;

      if (node.parameters.length > 1) {
        throw new Error(
          `Expected 0 or 1 parameters for ${interactionName}, got ${node.parameters.length}`,
        );
      }

      const [firstParameter] = node.parameters;

      if (firstParameter) {
        if (!firstParameter.type) {
          throw new Error(
            `Missing required type "${firstParameter.name.getText()}" for ${interactionName}`,
          );
        }

        const t = typeChecker.getTypeFromTypeNode(firstParameter.type);

        const parameters: Record<string, string> = JSON.parse(
          typeChecker
            .typeToString(t)
            .replace(/;(?!.*;)/g, '')
            .replace(/;/g, ',')
            .replace(/(\w+)/g, '"$1"'),
        );

        Object.entries(parameters).forEach(([paramName, paramType]) => {
          if (!allowedTypes.includes(paramType)) {
            throw new TypeError(
              `Unsupported type ${paramType} for ${paramName}`,
            );
          }
          parameters[paramName] = Case.pascal(paramType);
        });

        interaction.parameters = parameters as Record<
          string,
          InteractionOptionType
        >;
      }

      // function body
      const functionBody = node.getText(sourceFile);
      if (!functionBody) {
        throw new Error(
          `${interactionName} does not contain a function declaration`,
        );
      }

      interaction.function = ts.transpileModule(node.getText(), {}).outputText;
    }
  });

  if (!interaction.function) {
    throw new RangeError(`
    expected expression of the kind
      function ${interactionName}({ event, argument }: { event: Event, argument: ArgumentType }): ReturnType {
        // body
      }
    `);
  }

  return interaction as Interaction;
};
