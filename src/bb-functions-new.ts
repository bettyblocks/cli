import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

import { newFunctionDefinition } from './functions/functionDefinitions';

const program = new Command();

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
  } catch (error) {
    throw new Error(
      `functions/${inputFunctionName} could not be created. Error: ${error}`,
    );
  }
} else {
  throw new Error(
    `${workingDir} doesn't seem to be a functions project.\nPlease make sure you're in the root of the project.`,
  );
}
