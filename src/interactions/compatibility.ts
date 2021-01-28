import * as ts from 'typescript';
import path from 'path';
import Case from 'case';
import { Interaction, InteractionOptionType } from '../types';

export default (filename: string): Interaction => {
  if (!filename)
    throw new Error(`unable to determine interaction name from ${filename}`);

  const program = ts.createProgram([filename], {});
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filename);

  if (!sourceFile) throw new Error('no source file');

  const interactionName = Case.camel(
    path.basename(filename).replace(/.ts/, ''),
  );

  const interaction: Partial<Interaction> = {};

  // Loop through the root AST nodes of the file
  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node)) {
      // name
      const functionName = node.name ? node.name.text : '';
      if (functionName !== interactionName) return;

      interaction.name = functionName;

      // return type
      const typeNode = node.type;
      if (!typeNode)
        throw new Error(`You forgot to declare a type for ${interactionName}`);

      const returnType = typeChecker.typeToString(
        typeChecker.getTypeFromTypeNode(typeNode),
      );

      interaction.type = Case.pascal(returnType) as InteractionOptionType;

      if (node.parameters.length > 1) {
        throw new Error(`Only one parameter is allowed for ${interactionName}`);
      }

      const [firstParameter] = node.parameters;
      if (!firstParameter.type)
        throw new Error(
          `You forgot to add a type to the parameter for ${interactionName}`,
        );

      const t = typeChecker.getTypeFromTypeNode(firstParameter.type);

      const parameters: Record<string, string> = JSON.parse(
        typeChecker
          .typeToString(t)
          .replace(/;(?!.*;)/g, '')
          .replace(/;/g, ',')
          .replace(/(\w+)/g, '"$1"'),
      );

      Object.entries(parameters).forEach(([paramName, paramType]) => {
        parameters[paramName] = Case.pascal(paramType);
      });

      interaction.parameters = parameters as Record<
        string,
        InteractionOptionType
      >;

      // function body
      const functionBody = node.getText(sourceFile);
      if (!functionBody) {
        throw new Error(
          `You forgot to add code to your interaction for ${interactionName}`,
        );
      }

      interaction.function = ts.transpileModule(node.getText(), {}).outputText;
    }
  });

  return interaction as Interaction;
};
