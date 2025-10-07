import {
  type CustomTransformerFactory,
  flattenDiagnosticMessageText,
  JsxEmit,
  ScriptTarget,
  type SourceFile,
  type TransformerFactory,
  transpileModule,
} from 'typescript';

const { React } = JsxEmit;
const { ES5 } = ScriptTarget;

export const transpile = (
  code: string,
  before: (TransformerFactory<SourceFile> | CustomTransformerFactory)[],
): string => {
  const { diagnostics, outputText } = transpileModule(code, {
    compilerOptions: {
      allowJs: true,
      checkJs: true,
      downlevelIteration: true,
      jsx: React,
      // Requires tslib
      noEmitHelpers: true,
      target: ES5,
    },
    reportDiagnostics: true,
    transformers: {
      before,
    },
  });

  let messageText = '';
  if (diagnostics) {
    diagnostics.forEach((diagnostic) => {
      if (diagnostic.file) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
        messageText += ` ${diagnostic.file.fileName} (${line + 1},${
          character + 1
        })`;
      }
      messageText += `: ${flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      )}`;
    });
  }

  if (messageText) {
    throw new Error(messageText);
  }

  return outputText;
};

export const doTranspile = (code: string): string => transpile(code, []);
