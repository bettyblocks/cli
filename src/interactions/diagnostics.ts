import {
  createProgram,
  type Diagnostic,
  flattenDiagnosticMessageText,
  getDefaultCompilerOptions,
  getPreEmitDiagnostics,
} from 'typescript';

const reportDiagnostics = (diagnostics: Diagnostic[]): void => {
  diagnostics.forEach((diagnostic) => {
    let message = 'Error';
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start || 0,
      );
      message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
    }
    message += `: ${flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n',
    )}`;
    console.error(`\u001b[31m${message}\u001b[0m`);
  });
};

export default (filePath: string): void => {
  const config = getDefaultCompilerOptions();

  config.strict = true;

  const program = createProgram([filePath], config);

  const diagnostics = [...getPreEmitDiagnostics(program)];

  if (diagnostics.length > 0) {
    reportDiagnostics(diagnostics);
    process.exit(1);
  }
};
