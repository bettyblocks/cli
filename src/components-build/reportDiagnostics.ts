import ts from 'typescript';

export const reportDiagnostics = (diagnostics: ts.Diagnostic[]): void => {
  diagnostics.forEach((diagnostic) => {
    let message = 'Error';
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start || 0,
      );
      message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
    }
    message += `: ${ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n',
    )}`;
    console.error(`\u001b[31m${message}\u001b[0m`);
  });
};
