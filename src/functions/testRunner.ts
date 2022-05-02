/* npm dependencies */

import AdmZip from 'adm-zip';
import chalk from 'chalk';
import fs from 'fs-extra';
import ivm from 'isolated-vm';
import path from 'path';
import { spawn } from 'child_process';

/* internal dependencies */

import { zipFunctionDefinitions } from './functionDefinitions';

/* execute command */

const check = chalk.green(`✔`);
const cross = chalk.red(`✖`);
const right = chalk.green(`›`);

const build = async (
  testFile: string,
  workingDir: string,
): Promise<{ exitCode: number; stdout: string; stderr: string }> => {
  const functionsDir = path.join(workingDir, 'functions');
  const tmpDir = path.join(workingDir, '.tmp');

  const zipFile = zipFunctionDefinitions(functionsDir);
  const zip = new AdmZip(zipFile);
  zip.extractAllTo(path.join(tmpDir, 'app'), true);

  fs.writeJSONSync(
    path.join(tmpDir, 'package.json'),
    {
      name: 'app',
      dependencies: { app: 'file:./app' },
      devDependencies: {
        webpack: '^5.10.0',
        'webpack-cli': '^4.2.0',
      },
      scripts: {
        all: 'yarn --force && yarn build',
        build: 'npx webpack --config webpack.config.js',
      },
    },
    { spaces: 2 },
  );

  fs.writeFileSync(
    path.join(tmpDir, 'webpack.config.js'),
    `module.exports = {
  target: 'node',
  entry: './app.js',
  mode: 'production',
  output: {
    filename: 'app.bundle.js',
    libraryTarget: 'var',
    library: 'app',
  },
};
`,
  );

  fs.writeFileSync(
    path.join(tmpDir, 'app.js'),
    `import * as $app from 'app';

${fs.readFileSync(path.join(workingDir, testFile), 'utf-8')}
`,
  );

  let stdout = '';
  let stderr = '';

  const exitCode = await new Promise<number>((res) => {
    const process = spawn(`cd ${tmpDir} && yarn && yarn all`, {
      shell: true,
    });
    process.stdout.on('data', (data) => {
      stdout += data;
    });
    process.stderr.on('data', (data) => {
      stderr += data;
    });
    process.on('close', res);
  });

  return { exitCode, stdout, stderr };
};

const run = (testFile: string, workingDir: string): Promise<string> => {
  const helpers = path.join(
    workingDir,
    testFile.split(/[\\/]/)[0],
    'helpers.js',
  );

  const bundle = path.join(workingDir, '.tmp', 'dist', 'app.bundle.js');
  const isolate = new ivm.Isolate({ memoryLimit: 128 });

  const context = isolate.createContextSync();
  context.global.setSync('ivm', ivm);

  const script = isolate.compileScriptSync(
    `function run(resolve, reject) {
  ${fs.existsSync(helpers) ? fs.readFileSync(helpers, 'utf-8') : ''}
  ${fs.readFileSync(bundle, 'utf-8')}

  app
    .default()
    .then((result) => {
      resolve.applyIgnored(null, [
        new ivm.ExternalCopy(JSON.stringify(result)).copyInto(),
      ]);
    })
    .catch((error) => {
      reject.applyIgnored(null, [
        new ivm.ExternalCopy(
          JSON.stringify({
            error: {
              message: error.message || error,
              code: 'RUNTIME_ERROR',
            },
          })
        ).copyInto(),
      ]);
    });;
}
`,
  );

  return new Promise((resolve, reject) => {
    try {
      script.runSync(context);
      context.global
        .getSync('run', { reference: true })
        .applySync(
          null,
          [new ivm.Reference(resolve), new ivm.Reference(reject)],
          { timeout: 60000 },
        );
    } catch (error) {
      reject(error);
    }
  });
};

const runTest = async (testFile: string, workingDir: string): Promise<void> => {
  if (!fs.existsSync(path.join(workingDir, testFile))) {
    console.log(`${cross} ${testFile} could not be found`);
    return;
  }

  console.log(`${right} Building artifacts ...`);
  const { exitCode, stdout } = await build(testFile, workingDir);

  if (exitCode) {
    console.log(`${cross} ${stdout}`);
    return;
  }

  try {
    console.log(`${check} Build succeeded`);
    console.log(`${right} Running test ...`);
    const output = await run(testFile, workingDir);
    console.log(`${check} ${output}`);
  } catch (error) {
    console.log(`${cross} ${String(error)}`);
  }
};

export { runTest };
