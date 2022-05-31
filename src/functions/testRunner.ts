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
        lodash: '^4.17.15',
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
    `import { default as $app } from 'app';
import _ from 'lodash';

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
  context.global.setSync(
    `$console`,
    new ivm.Reference(
      (level: 'log' | 'debug' | 'info' | 'warn' | 'error', args: unknown[]) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console[level](...args),
    ),
  );

  const script = isolate.compileScriptSync(
    `function run(resolve, reject) {
  
  const tests = [];
  let failures = 0;
  
  const console = (() => {
    const log = (level) =>
      (...args) =>
        $console.apply(null, [
          level,
          new ivm.ExternalCopy(args).copyInto()
        ]);

    return {
      log: log('log'),
      debug: log('debug'),
      info: log('info'),
      warn: log('warn'),
      error: log('error'),
    };
  })();

  const test = (desc, fn) => {
    tests.push(new Promise((resolve, reject) => {
      fn()
        .then(() => {
          console.log('\\x1b[32m%s\\x1b[0m', '\\u2714 test ' + JSON.stringify(desc));
          resolve();
        })
        .catch((e) => {
          console.log('\\x1b[31m%s\\x1b[0m', '\\u2718 test ' + JSON.stringify(desc));
          console.error(e.message);
          resolve();
          failures++;
        });
    }));
  };

  const assert = (left, right) => {
    if (!_.isEqual(left, right)) {
      throw new Error(\`\\x1b[31m  Assertion failed\\x1b[0m
  \\x1b[36mleft:\\x1b[0m   \${JSON.stringify(left)}
  \\x1b[36mright:\\x1b[0m  \${JSON.stringify(right)}\`);
    }
  };

  ${fs.existsSync(helpers) ? fs.readFileSync(helpers, 'utf-8') : ''}
  ${fs.readFileSync(bundle, 'utf-8')}

  Promise.all(tests).then(() => {
    let summary;
    
    if (failures) {
      summary = \`\\x1b[31m\${tests.length} tests, \${failures} failure\${
        failures > 1 ? 's' : ''
      }\\x1b[0m\`;
    } else {
      summary = \`\\x1b[32m\${tests.length} tests, 0 failures\\x1b[0m\`;
    }
    
    resolve.applyIgnored(null, [
      new ivm.ExternalCopy(summary).copyInto()
    ]);
  });
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

  let time: number;
  const start = () => new Date().getTime();
  const stop = () => (new Date().getTime() - time) / 1000;

  console.log(`${right} Building artifacts ...`);

  time = start();
  const { exitCode, stdout } = await build(testFile, workingDir);
  const buildTime = stop();

  if (exitCode) {
    console.log(`${cross} ${stdout}`);
    return;
  }

  try {
    console.log(`${check} Build succeeded`);
    console.log(`${right} Running tests ...`);

    time = start();
    const summary = await run(testFile, workingDir);
    const testTime = stop();

    console.log(
      `\nFinished in ${(buildTime + testTime).toFixed(
        3,
      )} seconds (build: ${buildTime.toFixed(3)}s, tests: ${testTime.toFixed(
        3,
      )})`,
    );
    console.log(summary);
  } catch (error) {
    console.log(`${cross} ${String(error)}`);
  }
};

export { runTest };
