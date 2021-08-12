import program from 'commander';
import IDE from './utils/ide';
import Config from './functions/config';

/* process arguments */
program.name('bb functions login').parse(process.argv);

(async (): Promise<void> => {
  const config = new Config();

  const ide = new IDE(config);
  await ide.fusionAuth.ensureLogin();

  console.log('Logged in!');
})();
