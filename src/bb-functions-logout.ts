import program from 'commander';
import Config from './functions/config';
import FusionAuth from './utils/login';

/* process arguments */
program.name('bb functions logout').parse(process.argv);
const config = new Config();
const fusionAuth = new FusionAuth(config);

fusionAuth.clearTokens();

console.log('You are now logged out!');
