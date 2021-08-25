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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (firstDiagnostic) messageText = firstDiagnostic.messageText as any;

  if (messageText) {
    throw new Error(messageText as string);
  }

  return outputText;
};

// @FIXME: This is just to make sure the tests don't break (defineFunction and eventHanlders)
export const doTranspile = (code: string): string => transpile(code, []);
