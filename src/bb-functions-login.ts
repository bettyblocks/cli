import { Command } from 'commander';

import Config from './functions/config';
import FusionAuth from './utils/login';

const program = new Command();

program.name('bb functions login').parse(process.argv);

void (async (): Promise<void> => {
  const config = new Config();
  const fusionAuth = new FusionAuth(config);

  const loggedIn = await fusionAuth.login();

  if (loggedIn) {
    console.log(`You are now logged in.`);
  } else {
    console.log(`Couldn't log you in.`);
  }
})();
