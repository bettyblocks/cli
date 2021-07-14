/* npm dependencies */

import fs from 'fs-extra';
import path from 'path';
import program from 'commander';

/* internal dependencies */

import { functionValidator, validateFunction } from './utils/validateFunction';

/* process arguments */
program
  .usage('[function-name]')
  .name('bb functions validate')
  .option('-s', '--schema', 'Schema URL.')
  .parse(process.argv);

const {
  args: [functionName],
} = program;
const { schema: schemaUrl } = program;
/* execute command */

const workingDir = process.cwd();
const baseFunctionsPath = path.join(workingDir, 'functions');

(async (): Promise<void> => {
  const { validator, functionSchema } = await functionValidator(schemaUrl);
  if (functionName) {
    const functionPath = path.join(baseFunctionsPath, functionName);
    validateFunction(functionPath, validator, functionSchema);
  } else {
    fs.readdirSync(baseFunctionsPath).forEach(functionDir => {
      const functionPath = path.join(baseFunctionsPath, functionDir);
      validateFunction(functionPath, validator, functionSchema);
    });
  }
})();
