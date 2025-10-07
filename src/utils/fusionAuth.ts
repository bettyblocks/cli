import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import prompts from 'prompts';
import Webhead, {
  type WebheadInstance,
  type WebheadRequestOptions,
} from 'webhead';

import Config from '../functions/config';

interface LoginResponse {
  token: string;
  refreshToken: string;
  twoFactorId: string;
}

interface TwoFactorLoginResponse {
  token: string;
  refreshToken: string;
}

interface UserResponse {
  user: object;
}

class FusionAuth {
  private configFile: string;

  private config: Config;

  public loginId?: string;

  public password?: string;

  private relogin: () => Promise<void>;

  private webhead: WebheadInstance;

  constructor(config: Config, relogin: () => Promise<void>) {
    this.configFile = path.join(os.homedir(), '.bb-cli-fa');
    this.config = config;
    this.relogin = relogin;
    this.webhead = Webhead();
  }

  async ensureLogin(): Promise<void> {
    const response = await this.get<UserResponse>('/api/user', {
      headers: {
        Authorization: `Bearer ${this.jwt() ?? ''}`,
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
    const { code } = (await prompts([
      {
        message: 'Fill in your 2FA code (to upload code)',
        name: 'code',
        type: 'text',
      },
    ])) as { code: string };

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

  async upload(
    config: Config,
    zipFile: string,
    functionsJson: string,
  ): Promise<boolean> {
    await this.ensureLogin();
    const applicationId = await config.applicationId();
    const url = `${config.builderApiUrl}/artifacts/actions/${
      applicationId ?? ''
    }/functions`;

    const { statusCode } = await this.webhead.post(url, {
      headers: {
        Authorization: `Bearer ${this.jwt() ?? ''}`,
      },
      multiPartData: [
        { file: zipFile, name: 'file' },
        { contents: functionsJson, name: 'functions' },
      ],
    });

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
      await this.webhead.get(this.config.fusionAuthUrl);
    }
    await this.webhead[method](urlPath, options);

    return this.webhead.json() ?? this.webhead.text();
  }

  private storeTokens(jwt: string, refreshToken: string): void {
    fs.writeJsonSync(this.configFile, { jwt, refreshToken });
  }

  private jwt(): string | null {
    let jwt;

    if (fs.pathExistsSync(this.configFile)) {
      ({ jwt } = fs.readJsonSync(this.configFile));
    }

    return jwt ?? null;
  }
}

export default FusionAuth;
