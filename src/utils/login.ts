import prompts from 'prompts';
import fetch from 'node-fetch';
import Config, { GlobalConfig } from '../functions/config';

const readAuthConfig = (): GlobalConfig => {
  return Config.readGlobalConfig();
};

const storeAuthConfig = (auth: object): void => {
  Config.writeToGlobalConfig('auth', {
    ...readAuthConfig().auth,
    ...auth
  });
};

const promptCredentials = async (): Promise<{
  email: string;
  password: string;
}> => {
  const config = readAuthConfig();

  const { email, password } = await prompts([
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
  ]);

  if (!email.match(/@/)) {
    console.log(`Can't login without an email :)`);
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

  async login(): Promise<boolean> {
    this.clearToken();

    await this.ensureLogin();

    return this.tokenExists();
  }

  async ensureLogin(): Promise<boolean> {
    const { email, password } = await promptCredentials();

    const result = await fetch(`${this.config.fusionAuthUrl}/api/login`, {
      method: 'POST',
      body: JSON.stringify({
        loginId: email,
        password,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then(resp => {
      if (resp.ok) {
        return resp.json();
      }
      return this.ensureLogin();
    });

    if (result.token) {
      this.storeToken(result.token);
      return true;
    }
    return false;
  }

  jwt(): string | undefined {
    return readAuthConfig().auth[this.jwtKey()];
  }

  storeToken(token: string): void {
    storeAuthConfig({
      [this.jwtKey()]: token,
    });
  }

  clearToken(): void {
    storeAuthConfig({
      [this.jwtKey()]: undefined,
    });
  }

  tokenExists(): boolean {
    return !!this.jwt();
  }

  jwtKey(): string {
    return `jwt-${this.config.zone}`;
  }
}

export default FusionAuth;
