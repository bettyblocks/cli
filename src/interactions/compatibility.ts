import * as ts from 'typescript';
import path from 'path';
import Case from 'case';
import { InteractionCompatibility, InteractionOptionType } from '../types';

interface TypeDefinition {
  name: Node;
  type: Node;
}

export default (code: string, filename: string): InteractionCompatibility => {
  console.log(filename);
  if (!filename)
    throw new Error(`unable to determine interaction name from ${filename}`);

  const sourceFile = ts.createSourceFile(
    'unknown.ts',
    code,
    ts.ScriptTarget.ES2016,
  );

  const interactionName = Case.camel(
    path.basename(filename).replace(/.ts/, ''),
  );

  const interaction: Partial<InteractionCompatibility> = {};

  // Loop through the root AST nodes of the file
  ts.forEachChild(sourceFile, node => {
    // This is an incomplete set of AST nodes which could have a top level identifier
    // it's left to you to expand this list, which you can do by using
    // https://ts-ast-viewer.com/ to see the AST of a file then use the same patterns
    // as below

    if (ts.isFunctionDeclaration(node)) {
      const functionName = node.name ? node.name.text : '';
      if (functionName !== interactionName) return;

      interaction.name = functionName;
      //   // Hide the method body when printing
      //   //   node.body = undefined;
      // } else if (ts.isVariableStatement(node)) {
      //   name = node.declarationList.declarations[0].name.getText(sourceFile);
      // } else if (ts.isInterfaceDeclaration(node)) {
      //   name = node.name.text;

      const returnType = node.type ? node.type.getText(sourceFile) : '';
      if (!returnType)
        throw new Error(`You forgot to declare a type for ${interactionName}`);

      const functionBody = node.getText(sourceFile);
      if (!functionBody)
        throw new Error(
          `You forgot to add code to your interaction for ${interactionName}`,
        );

      interaction.type = Case.pascal(returnType) as InteractionOptionType;
      //   interaction.function = functionBody; TODO
      const [firstParameter = ''] = node.parameters;
      if (firstParameter) {
        const firstPrameterText = firstParameter.getText(sourceFile);
        let payload = firstPrameterText.slice(
          firstPrameterText.indexOf(':') + 1,
        );
        payload = payload.replace(/;/g, ',');
        console.log(payload);
        interaction.parameters = JSON.parse(payload);
      }
    }
  });

  console.log(interaction);

  return interaction as InteractionCompatibility;
};
