/* npm dependencies */

import chalk from 'chalk';
import program from 'commander';
import { parseDir, parsePort } from './utils/arguments';
import serveComponentSet from './utils/serveComponentSet';
import { ServeOptions } from './types';

/* internal dependencies */

/* process arguments */

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
  .parse(process.argv);

const options: ServeOptions = {
  rootDir: parseDir(program.args),
  port: program.port as number,
  host: program.host as string,
  ssl: program.ssl as boolean,
  sslKey: program.sslKey as string,
  sslCert: program.sslCert as string,
};

/* execute command */
serveComponentSet(options).then(
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
