import program from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { newFunctionDefinition } from './functions/functionDefinitions';

/* process arguments */
program.usage('[function-name]').name('bb functions new').parse(process.argv);

const {
  args: [inputFunctionName],
} = program;

const workingDir = process.cwd();
if (fs.existsSync(path.join(workingDir, '.app-functions'))) {
  try {
    const functionsDir = path.join(workingDir, 'functions');
    newFunctionDefinition(functionsDir, inputFunctionName);

    console.log(`functions/${inputFunctionName} created`);
  } catch (err) {
    console.log(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `functions/${inputFunctionName} could not be created. Error: ${err}`,
    );
  }
} else {
  console.log(
    `${workingDir} doesn't seem to be a functions project.\nPlease make sure you're in the root of the project.`,
  );
}
