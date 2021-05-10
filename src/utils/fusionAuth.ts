import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import prompts from 'prompts';
import Webhead, { WebheadInstance } from 'webhead';

const builderApiURL = '{HOST}/api/builder';
const fusionAuthURL = 'https://fusionauth-ce.betty.services';

type response = string | object | null;

class FusionAuth {
  private configFile: string;

  private host: string;

  public loginId?: string;

  public password?: string;

  private relogin: () => Promise<void>;

  private webhead: WebheadInstance;

  constructor(host: string, relogin: () => Promise<void>) {
    this.configFile = path.join(os.homedir(), '.bb-cli-fa');
    this.host = host;
    this.relogin = relogin;
    this.webhead = Webhead();
  }

  async ensureLogin(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await this.get('/api/user', {
      headers: {
        Authorization: `Bearer ${this.jwt()}`,
      },
    });

    if (!response || !response.user) {
      if (!this.loginId) {
        await this.relogin();
      }
      await this.login();
    }
  }

  async login(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { token, refreshToken, twoFactorId }: any = await this.post(
      '/api/login',
      {
        json: {
          loginId: this.loginId,
          password: this.password,
        },
      },
    );

    if (token) {
      this.storeTokens(token, refreshToken);
    } else if (twoFactorId) {
      await this.complete2FA(twoFactorId);
    }
  }

  async complete2FA(twoFactorId: string): Promise<void> {
    const { code } = await prompts([
      {
        type: 'text',
        name: 'code',
        message: 'Fill in your 2FA code',
      },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { token, refreshToken }: any = await this.post(
      '/api/two-factor/login',
      {
        json: {
          code,
          twoFactorId,
        },
      },
    );

    if (token) {
      this.storeTokens(token, refreshToken);
    } else {
      await this.complete2FA(twoFactorId);
    }
  }

  async upload(uuid: string, zipFile: string): Promise<boolean> {
    await this.ensureLogin();

    const { statusCode } = await this.webhead.post(
      `${this.builderApiURL()}/artifacts/actions/${uuid}/functions`,
      {
        headers: {
          Authorization: `Bearer ${this.jwt()}`,
        },
        multiPartData: [{ name: 'file', file: zipFile }],
      },
    );

    return !!statusCode.toString().match(/^2/);
  }

  async get(urlPath: string, options: object): Promise<response> {
    return this.request('get', urlPath, options);
  }

  async post(urlPath: string, options: object): Promise<response> {
    return this.request('post', urlPath, options);
  }

  private async request(
    method: 'get' | 'post',
    urlPath: string,
    options: object,
  ): Promise<response> {
    if (!this.webhead.url) {
      await this.webhead.get(fusionAuthURL);
    }

    await this.webhead[method](urlPath, options);
    return this.webhead.json() || this.webhead.text();
  }

  private storeTokens(jwt: string, refreshToken: string): void {
    fs.writeJsonSync(this.configFile, { jwt, refreshToken });
  }

  private jwt(): string | null {
    let jwt;

    if (fs.pathExistsSync(this.configFile)) {
      jwt = fs.readJsonSync(this.configFile).jwt;
    }

    return jwt || null;
  }

  private builderApiURL(): string {
    return builderApiURL.replace('{HOST}', this.host);
  }
}

export default FusionAuth;
