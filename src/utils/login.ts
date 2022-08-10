import prompts from 'prompts';
import fetch from 'node-fetch';
import Config, { GlobalConfig } from '../functions/config';

type LoginResponse = {
  token: string;
  twoFactorId: string;
};

type TwoFactorLoginResponse = {
  token: string;
};

const readAuthConfig = (): GlobalConfig => {
  return Config.readGlobalConfig();
};

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
      type: 'text',
      name: 'email',
      message: 'Fill in your e-mail address',
      initial: config.auth.email,
    },
    {
      type: 'password',
      name: 'password',
      message: 'Fill in your password',
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
      method: 'POST',
      body: JSON.stringify({
        loginId: email,
        password,
      }),
      headers: { 'Content-Type': 'application/json', ...additionalHeaders },
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
        type: 'text',
        name: 'code',
        message: 'Fill in your 2FA code',
      },
    ])) as { code: string };

    return fetch(`${this.config.fusionAuthUrl}/api/two-factor/login`, {
      method: 'POST',
      body: JSON.stringify({
        code,
        twoFactorId,
      }),
      headers: { 'Content-Type': 'application/json' },
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
