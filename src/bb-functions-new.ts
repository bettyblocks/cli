import program from 'commander';
import path from 'path';
import { newFunctionDefinition } from './functions/functionDefinitions';

/* process arguments */
program
  .usage('[function-name]')
  .name('bb functions new')
  .parse(process.argv);

const {
  args: [inputFunctionName],
} = program;

(async (): Promise<void> => {
  const workingDir = process.cwd();
  const functionsDir = path.join(workingDir, 'functions');
  newFunctionDefinition(functionsDir, inputFunctionName);

  console.log(`Function ${inputFunctionName} was created!`);
})();
