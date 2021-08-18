import fs from 'fs-extra';
import path from 'path';

import IDE from '../utils/ide';

const configPath = (): string => path.join(process.cwd(), 'config.json');

const readConfig = (): Cfg | undefined => {
  const cfgPath = configPath();
  if (fs.pathExistsSync(cfgPath)) {
    return fs.readJsonSync(cfgPath) as Cfg;
  }

  return {} as Cfg;
};

const defaultConfig = (): Cfg => {
  return {
    schemaUrl: 'https://github.com',
    functionSchemaPath:
      '/bettyblocks/json-schema/raw/master/schemas/actions/function.json',
    cacheDir: '.tmp/',
    fusionAuthUrl: 'https://fusionauth{ZONEPOSTFIX}.betty.services',
    builderApiUrl: '{HOST}/api/builder',
    domain: 'bettyblocks.com',
  } as Cfg;
};

class Config {
  private config: Cfg;

  private _identifier?: string;

  private _zone?: string;

  private _host?: string;

  private _applicationId?: string;

  constructor() {
    this.config = {
      ...defaultConfig(),
      ...readConfig(),
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
      const ide = new IDE(this);
      await ide.get(this.host);
      await ide.webhead.get('/');
      const text: string = ide.webhead.text() || '';

      [, this._applicationId] =
        text.match(/Betty\.application_id = '([0-9a-f]+)'/) || [];
    }

    return this._applicationId;
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

export type Cfg = {
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

export default Config;
