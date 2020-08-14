import fs from 'fs-extra';
import ora from 'ora';
import os from 'os';
import path from 'path';
import prompts from 'prompts';
import puppeteer from 'puppeteer';
import request from 'request';

type NamedObject = Record<string, string | object>;

type RequestOptions = {
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  headers: NamedObject;
  body?: NamedObject;
  formData?: NamedObject;
  json: boolean;
};

const URL = 'https://{IDENTIFIER}.bettyblocks.com{PATH}';

class IDE {
  identifier: string;

  csrfToken?: string;

  private browser?: puppeteer.Browser;

  private page?: puppeteer.Page;

  private cookie: string;

  constructor(identifier: string) {
    this.identifier = identifier;
    this.cookie = '';
  }

  async get(
    requestPath: string,
    label?: string,
  ): Promise<string | object | null> {
    return this.request('GET', requestPath, undefined, label);
  }

  async post(
    requestPath: string,
    params: NamedObject,
    label?: string,
  ): Promise<string | object | null> {
    return this.request('POST', requestPath, params, label);
  }

  async put(
    requestPath: string,
    params: NamedObject,
    label?: string,
  ): Promise<string | object | null> {
    return this.request('PUT', requestPath, params, label);
  }

  async close(): Promise<void> {
    return this.browser && this.browser.close();
  }

  private async request(
    method: 'GET' | 'POST' | 'PUT',
    requestPath: string,
    params?: NamedObject,
    label?: string,
  ): Promise<string | object | null> {
    await this.initializePage();

    if (!this.page) return null;

    const options: RequestOptions = {
      method,
      url: URL.replace('{IDENTIFIER}', this.identifier).replace(
        '{PATH}',
        `/api/${requestPath}`,
      ),
      headers: { Cookie: this.cookie },
      json: false,
    };

    if (method !== 'GET' && this.csrfToken) {
      options.headers['x-csrf-token'] = this.csrfToken;
    }

    if (params) {
      if (params.code) {
        const code = fs.createReadStream(
          (params.code as string).split('file://')[1],
        );
        options.formData = { code };
      } else {
        options.headers['x-requested-with'] = 'XMLHttpRequest';
        options.body = params;
        options.json = true;
      }
    }

    let spinner: ora.Ora;

    if (label) {
      spinner = ora(label).start();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const response = await new Promise<string | object>((resolve, reject) => {
      request(options, (err, res, bod) => {
        if (!err && res.statusCode < 400) {
          const json = res.headers['content-type'] === 'application/json';
          if (spinner) spinner.succeed();
          resolve(json && typeof bod === 'string' ? JSON.parse(bod) : bod);
        } else {
          if (spinner) spinner.fail();
          reject(err || bod.replace(/<[^>]+?>/g, ''));
        }
      });
    });

    return response;
  }

  private async initializePage(): Promise<void> {
    if (!this.page) {
      this.browser = await puppeteer.launch();
      this.page = await this.browser.newPage();

      await this.ensureLogin();
      const cookies = await this.page.cookies();

      this.cookie = cookies
        .map(({ name, value }) => `${name}=${value};`)
        .join(' ');

      this.csrfToken = await this.page.evaluate(() => {
        // eslint-disable-next-line no-eval
        return eval('Betty.CSRF');
      });
    }
  }

  private async ensureLogin(): Promise<void> {
    if (!this.page) return;

    const loginRegex = /l(ogin)?\.((edge|acceptance)\.)?betty.*?\/login/;
    const configFile = path.join(os.homedir(), '.bb-cli');
    const config = fs.readJsonSync(configFile, { throws: false }) || {};

    if (!config.cookies) {
      config.cookies = {};
    }

    const cookies = config.cookies[this.identifier];
    if (cookies) await this.page.setCookie(...cookies);

    await this.page.goto(
      URL.replace('{IDENTIFIER}', this.identifier).replace('{PATH}', ''),
    );

    if (this.page.url().match(loginRegex)) {
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

      config.email = email;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      this.page.evaluate(
        (username: string, passwd: string) => {
          // eslint-disable-next-line no-undef
          (document.querySelector(
            'input[name=username]',
          ) as HTMLInputElement).value = username;
          // eslint-disable-next-line no-undef
          (document.querySelector(
            'input[name=password]',
          ) as HTMLInputElement).value = passwd;
          // eslint-disable-next-line no-undef
          (document.querySelector('form') as HTMLFormElement).submit();
        },
        email,
        password,
      );

      await this.page.waitForNavigation();
      await this.ensureLogin();

      config.cookies[this.identifier] = await this.page.cookies();

      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    }
  }
}

export default IDE;
