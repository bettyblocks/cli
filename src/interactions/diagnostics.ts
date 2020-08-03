import { readFileSync } from 'fs';
import * as path from 'path';

import {
  createProgram,
  Diagnostic,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  getDefaultCompilerOptions,
  parseJsonConfigFileContent,
  parseConfigFileTextToJson,
  sys,
  ParsedCommandLine,
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

function getCompilerOptions(): ParsedCommandLine {
  const fileName = `${__dirname}/../../compilerOptions.json`;
  const configFileString = readFileSync(fileName).toString();

  const result = parseConfigFileTextToJson(fileName, configFileString);

  if (!result.config) {
    reportDiagnostics([...(result.error ? [result.error] : [])]);
    process.exit(1);
  }

  const parsedConfig = parseJsonConfigFileContent(
    result.config,
    sys,
    path.dirname(fileName),
  );

  if (parsedConfig.errors.length > 0) {
    reportDiagnostics(parsedConfig.errors);
    process.exit(1);
  }

  return parsedConfig;
}

export default function(filePath: string): void {
  const config = getCompilerOptions();

  const program = createProgram(
    [filePath],
    config.options || getDefaultCompilerOptions(),
  );
  const emitResult = program.emit();

  const diagnostics = [
    ...getPreEmitDiagnostics(program),
    ...emitResult.diagnostics,
  ];

  if (diagnostics.length > 0) {
    reportDiagnostics(diagnostics);
    process.exit(1);
  }
}
