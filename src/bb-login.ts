/* npm dependencies */

import got from 'got';
import program, { CommanderStatic } from 'commander';
import { setPassword } from 'keytar';

import prompt from './bb-login/prompt';
import { User } from './types';

program
  .usage('')
  .name('bb login')
  .option(
    '--server [url]',
    'Use a custom login server. Defaults to the Betty Blocks login server.',
  )
  .option(
    '--application-id [uuid]',
    'Use a custom login server application. Defaults to the Betty Blocks login server application.',
  )
  .parse(process.argv);

const {
  server = 'http://localhost:9011',
  applicationId = '22222222-2222-2222-2222-222222222222',
}: CommanderStatic = program;

(async (): Promise<void> => {
  const { email, password } = await prompt();

  try {
    const { body } = await got.post(`${server}/api/login`, {
      body: JSON.stringify({
        applicationId,
        loginId: email,
        password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });

    const {
      refreshToken,
      token,
    }: { refreshToken: string; token: string; user: User } = body;

    await Promise.all([
      setPassword('betty-blocks', 'access_token', token),
      setPassword('betty-blocks', 'refresh_token', refreshToken),
    ]);
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
