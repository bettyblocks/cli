/* npm dependencies */

import got from 'got';
import program, { CommanderStatic } from 'commander';

import prompt from './bb-login/prompt';

program
  .usage('')
  .name('bb login')
  .option(
    '--server [url]',
    'Use a custom login server. Defaults to the Betty Blocks login server.',
  )
  .parse(process.argv);

const { server = 'http://localhost:9011' }: CommanderStatic = program;

(async (): Promise<void> => {
  const { email, password } = await prompt();

  try {
    const { body } = await got.post(`${server}/api/login`, {
      body: JSON.stringify({
        loginId: email,
        password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });

    // @TODO: Store the token/user info
    console.log(body);
  } catch (error) {
    const statusCode = error?.response?.statusCode;

    if (statusCode === 404) {
      throw new ReferenceError('404: user not found');
    }

    if (statusCode === 401) {
      throw new Error('401: unauthenticated');
    }

    throw error;
  }
})();
