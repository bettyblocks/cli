import got, { NormalizedOptions } from 'got';
import { getPassword } from 'keytar';
import { decode } from 'jsonwebtoken';

export default got.extend({
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      async (options: NormalizedOptions): Promise<void> => {
        let token = await getPassword('betty-blocks', 'access_token');

        if (token === null) {
          throw new Error('401: unauthorized, please use `bb login`');
        }

        const payload = decode(token);

        if (typeof payload !== 'string' && Date.now() > payload?.exp * 1000) {
          const refreshToken = await getPassword(
            'betty-blocks',
            'refresh_token',
          );

          const { body } = await got.post(
            // @TODO: Fetch baseURL from settings
            'http://localhost:9011/api/jwt/refresh',
            {
              body: JSON.stringify({ refreshToken }),
              headers: {
                'Content-Type': 'application/json',
              },
              responseType: 'json',
            },
          );

          token = body.token;
        }

        // eslint-disable-next-line no-param-reassign
        options.headers.Authorization = `Bearer ${token}`;
      },
    ],
  },
  responseType: 'json',
});
