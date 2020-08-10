/* npm dependencies */

import program from 'commander';

import { parseDir, parsePort } from './utils/arguments';
import serveComponentSet from './utils/serveComponentSet';
import { ServeOptions } from './types';

/* internal dependencies */

/* process arguments */

program
  .usage('[path]')
  .name('bb components serve')
  .option('-p, --port [port]', 'Port to listen on.', value => parsePort(value, 5001), 5001)
  .option('--host [host]', 'Host to listen on.', 'localhost')
  .option('--ssl', 'Serve using HTTPS.', false)
  .option('--ssl-key [ssl-key]', 'SSL certificate to use for serving HTTPS.')
  .option('--ssl-cert [ssl-cert]', 'SSL key to use for serving HTTPS.')
  .parse(process.argv);

const options: ServeOptions = {
  rootDir: parseDir(program.args),
  port: program.port,
  host: program.host,
  ssl: program.ssl,
  sslKey: program.sslKey,
  sslCert: program.sslCert,
};

/* execute command */
serveComponentSet(options);
