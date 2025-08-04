import chalk from 'chalk';
import { Command } from 'commander';
import { parseDir, parsePort } from './utils/arguments';
import serveComponentSet from './utils/serveComponentSet';
import type { ServeOptions } from './types';

const program = new Command();

const programOpts = program.opts();

program
  .usage('[path]')
  .name('bb components serve')
  .option(
    '-p, --port [port]',
    'Port to listen on.',
    (value: string) => parsePort(value, 5001),
    5001,
  )
  .option('--host [host]', 'Host to listen on.', 'localhost')
  .option('--ssl', 'Serve using HTTPS.', false)
  .option('--ssl-key [ssl-key]', 'SSL certificate to use for serving HTTPS.')
  .option('--ssl-cert [ssl-cert]', 'SSL key to use for serving HTTPS.')
  .option('--offline', 'skip update check')
  .parse(process.argv);

const options: ServeOptions = {
  rootDir: parseDir(program.args),
  port: programOpts.port as number,
  host: programOpts.host as string,
  ssl: programOpts.ssl as boolean,
  sslKey: programOpts.sslKey as string,
  sslCert: programOpts.sslCert as string,
};

const arg = process.argv.slice(2);
const hasOfflineFlag = arg.includes('--offline');

/* execute command */
serveComponentSet(options, hasOfflineFlag).then(
  () => {
    const scheme = options.ssl ? 'https' : 'http';
    const url = `${scheme}://${options.host}:${options.port}`;

    console.info(chalk.green(`Serving the component set at ${url}`));
  },
  (error) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(chalk.red(`\n${error}\n`));
    process.exit(1);
  },
);
