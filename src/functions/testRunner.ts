/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": true}] */
/* npm dependencies */

import AdmZip from 'adm-zip';
import chalk from 'chalk';
import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';
import { spawn } from 'child_process';

/* internal dependencies */

import { zipFunctionDefinitions } from './functionDefinitions';

// @ts-ignore
type Ivm = typeof import('isolated-vm');

/* execute command */

const check = chalk.green(`✔`);
const cross = chalk.red(`✖`);
const right = chalk.green(`›`);

const build = async (
  pattern: string,
  workingDir: string,
): Promise<{ exitCode: number; stdout: string; stderr: string }> => {
  const testFiles = glob
    .sync(`${pattern || 'test/'}**`.replace(/\\/g, '/'))
    .reduce((files, match) => {
      const file = match.replace(/\//g, path.sep);
      if (file.match(/\.test\.js$/)) {
        files.push(file);
      }
      return files;
    }, [] as string[]);

  if (!testFiles.length) {
    return { exitCode: 1, stdout: 'No test files found.', stderr: '' };
  }

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
    `import { default as $app } from 'app';

${testFiles.map((file) => fs.readFileSync(file, 'utf-8')).join('\n\n')}
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

const run = (workingDir: string, ivm: Ivm): Promise<string> => {
  const helpers = path.join(workingDir, 'test', 'helpers.js');
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
    const escape = (value) => {
      switch (typeof(value)) {
      case "function":
        return value.toString();
      case "object":
        if (value == null) {
          return value;
        }
        if (value instanceof Array) {
          return value.map(escape);
        } else {
          return Object.keys(value).reduce((o, k) => {
            o[k] = escape(value[k]);
            return o;
          }, {});
        }
      default:
        return value;
      }
    };

    const log = (level) =>
      (...args) =>
        $console.apply(null, [
          level,
          new ivm.ExternalCopy(escape(args)).copyInto()
        ]);

    return {
      log: log('log'),
      debug: log('debug'),
      info: log('info'),
      warn: log('warn'),
      error: log('error'),
    };
  })();

  const isEqual = (t,e) => {
    function n(t){return Object.prototype.toString.call(t).slice(8,-1).toLowerCase()}let r=n(t);return r===n(e)&&("array"===r?function(){if(t.length!==e.length)return!1;for(let n=0;n<t.length;n++)if(!isEqual(t[n],e[n]))return!1;return!0}():"object"===r?function(){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(let n in t)if(Object.prototype.hasOwnProperty.call(t,n)&&!isEqual(t[n],e[n]))return!1;return!0}():"function"===r?t.toString()===e.toString():t===e)
  };

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
    if (!isEqual(left, right)) {
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

const runTest = async (pattern: string, workingDir: string): Promise<void> => {
  try {
    // @ts-ignore
    const { default: ivm } = await import('isolated-vm');
    let time: number;
    const start = () => new Date().getTime();
    const stop = () => (new Date().getTime() - time) / 1000;

    console.log(`${right} Building artifacts ...`);

    time = start();
    const { exitCode, stdout } = await build(pattern, workingDir);
    const buildTime = stop();

    if (exitCode) {
      console.log(`${cross} ${stdout}`);
      return;
    }

    console.log(`${check} Build succeeded`);
    console.log(`${right} Running tests ...`);

    time = start();
    const summary = await run(workingDir, ivm);
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
    const { code } = error as { code: string };
    if (code === 'MODULE_NOT_FOUND')
      console.log(
        'Unable to run tests (isolated-vm is not installed). If you want to install isolated-vm, you will need to install the following requirements: (make, g++ and python) and run "npm update -g @betty-blocks/cli"',
      );
    else console.log(`${cross} ${String(error)}`);
  }
};

export { runTest };
