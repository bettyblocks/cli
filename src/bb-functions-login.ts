import program from 'commander';
import IDE from './utils/ide';
import { initConfig, setApplicationId } from './functions/config';

/* process arguments */
program.name('bb functions login').parse(process.argv);

(async (): Promise<void> => {
  const config = await initConfig();

  const ide = new IDE(config);

  await ide.get('/');

  await setApplicationId();

  console.log('Logged in!');
})();
