import chalk from 'chalk';
import fs from 'fs-extra';
import kebabCase from 'lodash/kebabCase';
import path from 'path';

import {
  functionDefinition,
  functionDefinitionPath,
  functionDirs,
  isFunctionVersion,
} from './functionDefinitions';

const check = chalk.green(`✔`);
const cross = chalk.red(`✖`);

const migrate = (functionsPath: string, verbose = false): void => {
  const log = (msg: string): void => {
    if (verbose) {
      console.log(msg);
    }
  };

  log('Checking for unversioned functions ...');

  functionDirs(functionsPath, true).forEach((functionPath) => {
    const definition = functionDefinition(functionPath, functionsPath);
    const { name } = definition;

    let { version } = definition;
    let postfix = kebabCase(name);

    if (isFunctionVersion(functionPath, functionsPath)) {
      postfix = `-${version}`;
    } else {
      version = '1.0';
      postfix = ` => ${path.join(name, version)}`;

      try {
        delete definition.schema.name;

        fs.writeJSONSync(
          functionDefinitionPath(functionPath),
          definition.schema,
          {
            spaces: 2,
          },
        );

        const tmpDir = '.tmp';
        const tempDir = path.join(tmpDir, `${kebabCase(name)}-${version}`);
        const targetDir = path.join(functionsPath, kebabCase(name));

        fs.ensureDirSync(tmpDir);
        fs.renameSync(functionPath, tempDir);
        fs.mkdirSync(targetDir);
        fs.moveSync(tempDir, path.join(targetDir, version));
      } catch {
        log(`${cross} Failed to version: ${name}`);
        return;
      }
    }

    log(`${check} Version: ${name}${postfix}`);
  });
};

export { migrate };
