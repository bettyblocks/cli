import fetch from 'node-fetch';
import prompts from 'prompts';

import Config, { type GlobalConfig } from '../functions/config';

interface LoginResponse {
  token: string;
  twoFactorId: string;
}

interface TwoFactorLoginResponse {
  token: string;
}

const readAuthConfig = (): GlobalConfig => Config.readGlobalConfig();

const storeAuthConfig = (auth: object): void => {
  Config.writeToGlobalConfig('auth', {
    ...readAuthConfig().auth,
    ...auth,
  });
};

const promptCredentials = async (): Promise<{
  email: string;
  password: string;
}> => {
  const config = readAuthConfig();

  const { email, password } = (await prompts([
    {
      initial: config.auth.email,
      message: 'Fill in your e-mail address',
      name: 'email',
      type: 'text',
    },
    {
      message: 'Fill in your password',
      name: 'password',
      type: 'password',
    },
  ])) as { email: string; password: string };

  if (!email.match(/@/)) {
    console.log(`Can't login without an email.`);
    process.exit();
  }

  storeAuthConfig({ email });

  return { email, password };
};

class FusionAuth {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  logout(): void {
    this.clearTokens();
  }

  async login(): Promise<boolean> {
    this.clearTokens();

    await this.ensureLogin();

    return this.tokenExists();
  }

  async ensureLogin(): Promise<void> {
    const { email, password } = await promptCredentials();

    const additionalHeaders = this.config.additionalHeaders();
    return fetch(`${this.config.fusionAuthUrl}/api/login`, {
      agent: this.config.agent,
      body: JSON.stringify({
        loginId: email,
        password,
      }),
      headers: { 'Content-Type': 'application/json', ...additionalHeaders },
      method: 'POST',
    }).then(async (resp) => {
      if (resp.status === 242) {
        const { twoFactorId } = (await resp.json()) as LoginResponse;
        return this.ensure2FA(twoFactorId);
      }
      if (resp.ok) {
        const { token } = (await resp.json()) as LoginResponse;
        return this.storeToken(token);
      }

      return this.ensureLogin();
    });
  }

  jwt(): string | undefined {
    return readAuthConfig().auth[this.jwtKey()];
  }

  async ensure2FA(twoFactorId: string): Promise<void> {
    const { code } = (await prompts([
      {
        message: 'Fill in your 2FA code',
        name: 'code',
        type: 'text',
      },
    ])) as { code: string };

    return fetch(`${this.config.fusionAuthUrl}/api/two-factor/login`, {
      agent: this.config.agent,
      body: JSON.stringify({
        code,
        twoFactorId,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).then(async (resp) => {
      if (resp.ok) {
        const { token } = (await resp.json()) as TwoFactorLoginResponse;
        this.storeToken(token);
      } else {
        await this.ensure2FA(twoFactorId);
      }
    });
  }

  storeToken(token: string): void {
    storeAuthConfig({
      [this.jwtKey()]: token,
    });
  }

  clearTokens(): void {
    storeAuthConfig({
      [this.jwtKey()]: undefined,
    });
  }

  tokenExists(): boolean {
    return !!this.jwt();
  }

  jwtKey(): string {
    return `jwt.${this.config.zone}`;
  }
}

export default FusionAuth;
