import {
  createProgram,
  Diagnostic,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  getDefaultCompilerOptions,
  CompilerOptions,
} from 'typescript';

function reportDiagnostics(diagnostics: Diagnostic[]): void {
  diagnostics.forEach(diagnostic => {
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
}

export default function(
  filePath: string,
  compilerOptions?: CompilerOptions,
): void {
  const options = compilerOptions || getDefaultCompilerOptions();

  options.strict = true;

  const program = createProgram([filePath], options);
  const emitResult = program.emit();

  const diagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics,
  );

  if (diagnostics.length > 0) {
    reportDiagnostics(diagnostics);
    process.exit(1);
  }
}
