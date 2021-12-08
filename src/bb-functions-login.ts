import program from 'commander';
import Config from './functions/config';
import FusionAuth from './utils/login';

/* process arguments */
program.name('bb functions login').parse(process.argv);

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  const config = new Config();
  const fusionAuth = new FusionAuth(config);
  const applicationId = await config.applicationId();

  if (!applicationId) {
    console.log(`Can't log in without an application ID`);
    return;
  }

  const loggedIn = await fusionAuth.login(applicationId);

  if (loggedIn) {
    console.log(`You are now logged in.`);
  } else {
    console.log(`Couldn't log you in.`);
  }
})();
