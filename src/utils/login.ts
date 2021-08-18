import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import prompts from 'prompts';
import fetch from 'node-fetch';
import Config from '../functions/config';

type LoginResponse = {
  token: string;
  refreshToken: string;
  twoFactorId: string;
};

type UserConfig = {
  email?: string;
};

const tokenDir = path.join(os.homedir(), '.bb-cli-login');
const userConfigPath = path.join(tokenDir, 'config.json');
fs.mkdirpSync(tokenDir);

const readConfig = (): UserConfig => {
  if (fs.existsSync(userConfigPath)) {
    return fs.readJSONSync(userConfigPath) as UserConfig;
  }
  return {} as UserConfig;
};

const storeConfig = (config: UserConfig): void => {
  fs.writeJSONSync(userConfigPath, config, { spaces: 2 });
};

const promptCredentials = async (): Promise<{
  email: string;
  password: string;
}> => {
  const config = readConfig();

  const { email, password } = await prompts([
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

  if (!email.match(/@/)) {
    console.log(`Can't login without an email :)`);
    process.exit();
  }

  storeConfig({ ...config, email });

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
      this.storeTokens({ jwt: result.token });
      return true;
    }
    return false;
  }

  tokenPath(): string {
    const tPath = path.join(tokenDir, `${this.config.zone}.json`);
    return tPath;
  }

  storeTokens(tokens: object): void {
    fs.writeJSONSync(this.tokenPath(), tokens, { spaces: 2 });
  }

  clearToken(): void {
    const fullPath = this.tokenPath();

    if (fs.existsSync(fullPath)) {
      fs.removeSync(fullPath);
    }
  }

  tokenExists(): boolean {
    return !!fs.existsSync(this.tokenPath());
  }
}

export default FusionAuth;
