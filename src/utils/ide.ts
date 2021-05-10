/* eslint-disable no-param-reassign */

import fs from 'fs-extra';
import ora from 'ora';
import os from 'os';
import path from 'path';
import prompts from 'prompts';
import Webhead, {
  AnyObject,
  WebheadInstance,
  WebheadRequestParameters,
} from 'webhead';

import FusionAuth from './fusionAuth';

type NamedObject = Record<string, string | object>;

class IDE {
  private configFile: string;

  private host: string;

  public webhead: WebheadInstance;

  public fusionAuth: FusionAuth;

  private loggedIn?: boolean;

  constructor(host: string) {
    this.configFile = path.join(os.homedir(), '.bb-cli');

    this.host = host;

    if (!fs.pathExistsSync(this.configFile)) {
      fs.writeFileSync(
        this.configFile,
        JSON.stringify({ cookies: [] }, null, 2),
      );
    }

    this.webhead = Webhead({
      jarFile: this.configFile,
      beforeSend: (
        { method, url, options }: WebheadRequestParameters,
        { csrfToken }: AnyObject,
      ) => {
        if (method !== 'GET' && csrfToken) {
          // eslint-disable-next-line no-unused-expressions
          options.headers || (options.headers = {});
          options.headers['X-Csrf-Token'] = csrfToken;
        }
        return { method, url, options };
      },
      complete: (
        _parameters: WebheadRequestParameters,
        session: AnyObject,
        webhead: WebheadInstance,
      ) => {
        if (!session.csrfToken) {
          const match = webhead.text().match(/Betty\.CSRF = '(.*?)'/);
          if (match) {
            const [, csrfToken] = match;
            session.csrfToken = csrfToken;
          }
        }
      },
    });

    this.fusionAuth = new FusionAuth(
      this.host,
      async (): Promise<void> => this.relogin(),
    );
  }

  async get(
    requestPath: string,
    label?: string,
  ): Promise<string | object | null> {
    return this.request('get', requestPath, undefined, label);
  }

  async post(
    requestPath: string,
    options: NamedObject,
    label?: string,
  ): Promise<string | object | null> {
    return this.request('post', requestPath, options, label);
  }

  async put(
    requestPath: string,
    options: NamedObject,
    label?: string,
  ): Promise<string | object | null> {
    return this.request('put', requestPath, options, label);
  }

  private async request(
    method: 'get' | 'post' | 'put',
    requestPath: string,
    options?: NamedObject,
    label?: string,
  ): Promise<string | object | null> {
    await this.ensureLogin();

    const spinner = label ? ora(label).start() : undefined;

    const { statusCode } = await this.webhead[method](
      `${this.host}/api/${requestPath}`,
      options,
    );

    if (spinner) {
      spinner[statusCode.toString().match(/^2/) ? 'succeed' : 'fail']();
    }

    return this.webhead.json() || this.webhead.text();
  }

  private async relogin(): Promise<void> {
    this.loggedIn = false;
    this.webhead.clearCookies();
    await this.ensureLogin();
  }

  private async ensureLogin(): Promise<void> {
    if (this.loggedIn) return;

    await this.webhead.get(this.host);

    if (this.webhead.text().match('redirect_location')) {
      await this.webhead.get('/login');
    }

    let email = '';
    let password = '';

    const ensureAuth = async (): Promise<void> => {
      const cassieLogin = !!this.webhead.$('form [name="username"]').length;
      const fusionAuthLogin = !!this.webhead.$('form [name="loginId"]').length;

      if (cassieLogin || fusionAuthLogin) {
        const config = fs.readJsonSync(this.configFile);
        const credentials = await prompts([
          {
            type: 'text',
            name: 'email',
            message: 'Fill in your e-mail address',
            initial: config.email,
          },
          {
            type: 'password',
            name: 'password',
            message: 'Fill in your password',
          },
        ]);

        email = credentials.email;
        password = credentials.password;

        config.email = email;
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));

        const identifier = cassieLogin ? 'username' : 'loginId';
        const input = {
          [identifier]: email,
          password,
        };

        await this.webhead.submit('form', input);

        await ensureAuth();
      }
    };

    const ensure2FA = async (): Promise<void> => {
      const cassie2FA = !!this.webhead.$('form[name="otp"]').length;
      const fusionAuth2FA = !!this.webhead.$('form[id="2fa-form"]').length;

      if (cassie2FA || fusionAuth2FA) {
        const { code } = await prompts([
          {
            type: 'text',
            name: 'code',
            message: 'Fill in your 2FA code',
          },
        ]);

        const name = cassie2FA ? 'otp' : 'code';
        const input = {
          [name]: code,
        };

        await this.webhead.submit(
          'form[name="otp"],form[id="2fa-form"]',
          input,
        );

        await ensure2FA();
      }
    };

    await ensureAuth();
    await ensure2FA();

    this.fusionAuth.loginId = email;
    this.fusionAuth.password = password;

    this.loggedIn = true;
  }
}

export default IDE;
