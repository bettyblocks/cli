import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import prompts from 'prompts';

export type GlobalConfig = {
  auth: {
    email: string;
    [key: string]: string | undefined;
  };
  applicationMap: { [key: string]: string };
};

export type LocalConfig = {
  schemaUrl: string;
  functionSchemaPath: string;
  cacheDir: string;
  fusionAuthUrl: string;
  builderApiUrl: string;
  domain: string;
  identifier?: string;
  host?: string;
  zone?: string;
  applicationId?: string;
};

class Config {
  /* static */
  public static localConfigPath = path.join(process.cwd(), 'config.json');

  public static globalConfigPath = path.join(os.homedir(), '.bb-cli.json');

  public static writeToGlobalConfig(key: string, value: string | object): void {
    const config = this.readGlobalConfig();

    this.writeGlobalConfig({
      ...config,
      [key]: value,
    });
  }

  public static readGlobalConfig(): GlobalConfig {
    this.ensureGlobalConfigExists();
    return fs.readJSONSync(this.globalConfigPath) as GlobalConfig;
  }

  private static ensureGlobalConfigExists(): void {
    if (!fs.existsSync(this.globalConfigPath)) {
      fs.writeJSONSync(this.globalConfigPath, {
        auth: {},
        applicationMap: {}
      }, { spaces: 2 });
    }
  }

  private static writeGlobalConfig(map: GlobalConfig): void {
    this.ensureGlobalConfigExists();
    fs.writeJSONSync(this.globalConfigPath, map, { spaces: 2 });
  }

  private static async promptApplicationId(
    identifier: string,
  ): Promise<string> {
    const { applicationId } = await prompts([
      {
        type: 'text',
        name: 'applicationId',
        message: `Please supply the ID for your application (${identifier})`,
      },
    ]);

    if (!applicationId) {
      return this.promptApplicationId(identifier);
    }
    this.writeToGlobalConfig('applicationMap', {
      ...Config.readGlobalConfig().applicationMap,
      [identifier]: applicationId
    });
    return applicationId;
  }

  private static readConfig = (): LocalConfig | undefined => {
    const cfgPath = Config.localConfigPath;
    if (fs.pathExistsSync(cfgPath)) {
      return fs.readJsonSync(cfgPath) as LocalConfig;
    }

    return {} as LocalConfig;
  };

  private static defaultConfig = (): LocalConfig => {
    return {
      schemaUrl: 'https://github.com',
      functionSchemaPath:
        '/bettyblocks/json-schema/raw/master/schemas/actions/function.json',
      cacheDir: '.tmp/',
      fusionAuthUrl: 'https://fusionauth{ZONEPOSTFIX}.betty.services',
      builderApiUrl: '{HOST}/api/builder',
      domain: 'bettyblocks.com',
    } as LocalConfig;
  };

  /* instance */
  private config: LocalConfig;

  private _identifier?: string;

  private _zone?: string;

  private _host?: string;

  private _applicationId?: string;

  constructor() {
    this.config = {
      ...Config.defaultConfig(),
      ...Config.readConfig(),
    };
  }

  get identifier(): string {
    if (!this._identifier) {
      this._identifier =
        this.config.identifier || path.basename(process.cwd()).split('.')[0];
    }

    return this._identifier;
  }

  get zone(): string {
    if (!this._zone) {
      this._zone =
        this.config.zone ||
        path.basename(process.cwd()).split('.')[1] ||
        'production';
    }

    return this._zone;
  }

  get host(): string {
    if (!this._host) {
      this._host = this.config.host || this.defaultHost();
    }

    return this._host;
  }

  get fusionAuthUrl(): string {
    let postfix = '';
    if (this.zone === 'acceptance') {
      postfix = '-ca';
    } else if (this.zone === 'edge') {
      postfix = '-ce';
    }

    return this.config.fusionAuthUrl.replace('{ZONEPOSTFIX}', postfix);
  }

  get builderApiUrl(): string {
    return this.config.builderApiUrl.replace('{HOST}', this.host);
  }

  async applicationId(): Promise<string | undefined> {
    if (!this._applicationId) {
      this._applicationId =
        this.config.applicationId || (await this.fetchApplicationId());
    }

    return this._applicationId;
  }

  async fetchApplicationId(): Promise<string> {
    const map = Config.readGlobalConfig();
    if (map.applicationMap[this.identifier]) {
      return map.applicationMap[this.identifier];
    }
    return Config.promptApplicationId(this.identifier);
  }

  get schemaUrl(): string {
    return this.config.schemaUrl;
  }

  get functionSchemaPath(): string {
    return this.config.functionSchemaPath;
  }

  private defaultHost(): string {
    let subdomain = this.identifier;
    if (this.zone !== 'production') {
      subdomain = `${subdomain}.${this.zone}`;
    }

    return `https://${subdomain}.${this.config.domain}`;
  }
}

export default Config;
