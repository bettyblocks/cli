import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import prompts from 'prompts';
import Webhead, { WebheadInstance, WebheadRequestOptions } from 'webhead';

const builderApiURL = '{HOST}/api/builder';
const fusionAuthURL = 'https://fusionauth{ZONEPOSTFIX}.betty.services';

type LoginResponse = {
  token: string;
  refreshToken: string;
  twoFactorId: string;
};

type TwoFactorLoginResponse = {
  token: string;
  refreshToken: string;
};

type UserResponse = {
  user: object;
};

class FusionAuth {
  private configFile: string;

  private host: string;

  private zone: string;

  public loginId?: string;

  public password?: string;

  private relogin: () => Promise<void>;

  private webhead: WebheadInstance;

  constructor(host: string, zone: string, relogin: () => Promise<void>) {
    this.configFile = path.join(os.homedir(), '.bb-cli-fa');
    this.host = host;
    this.zone = zone;
    this.relogin = relogin;
    this.webhead = Webhead();
  }

  async ensureLogin(): Promise<void> {
    const response = await this.get<UserResponse>('/api/user', {
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
    const { token, refreshToken, twoFactorId } = await this.post<LoginResponse>(
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
        message: 'Fill in your 2FA code (to upload code)',
      },
    ]);

    const { token, refreshToken } = await this.post<TwoFactorLoginResponse>(
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

  async get<T>(urlPath: string, options: WebheadRequestOptions): Promise<T> {
    return this.request('get', urlPath, options);
  }

  async post<T>(urlPath: string, options: WebheadRequestOptions): Promise<T> {
    return this.request('post', urlPath, options);
  }

  private async request<T>(
    method: 'get' | 'post',
    urlPath: string,
    options: WebheadRequestOptions,
  ): Promise<T> {
    if (!this.webhead.url) {
      await this.webhead.get(this.fusionAuthURL());
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

  private fusionAuthURL(): string {
    let prefix = '';
    if (this.zone === 'acceptance') {
      prefix = '-ca';
    } else if (this.zone === 'edge') {
      prefix = '-ce';
    }

    return fusionAuthURL.replace('{ZONEPOSTFIX}', prefix);
  }
}

export default FusionAuth;
