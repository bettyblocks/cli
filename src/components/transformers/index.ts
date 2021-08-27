import {
  CustomTransformerFactory,
  JsxEmit,
  ScriptTarget,
  SourceFile,
  TransformerFactory,
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

  let firstDiagnostic = null;

  if (diagnostics) [firstDiagnostic] = diagnostics;

  let messageText = '';

  if (firstDiagnostic) {
    if (typeof firstDiagnostic.messageText === 'string') {
      messageText = firstDiagnostic.messageText;
    } else {
      messageText = firstDiagnostic.messageText.messageText;
    }
  }

  if (messageText) {
    throw new Error(messageText);
  }

  return outputText;
};

export const doTranspile = (code: string): string => transpile(code, []);
