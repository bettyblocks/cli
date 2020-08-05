import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import prompts from 'prompts';
import puppeteer from 'puppeteer';

type NamedObject = Record<string, string | object>;

type Body = string | FormData | undefined;

type RequestParams = {
  method: string;
  headers: NamedObject;
  body: Body;
};

const PROTOCOL = 'https';
const HOST = 'bettyblocks.com';

class IDE {
  identifier: string;

  csrfToken?: string;

  private browser?: puppeteer.Browser;

  private page?: puppeteer.Page;

  private requestParams: Record<string, RequestParams>;

  constructor(identifier: string) {
    this.identifier = identifier;
    this.requestParams = {};
  }

  async get(requestPath: string): Promise<string | object | null> {
    return this.request('GET', requestPath);
  }

  async post(
    requestPath: string,
    params: NamedObject,
  ): Promise<string | object | null> {
    return this.request('POST', requestPath, params);
  }

  async put(
    requestPath: string,
    params: NamedObject,
  ): Promise<string | object | null> {
    return this.request('PUT', requestPath, params);
  }

  async close(): Promise<void> {
    return this.browser && this.browser.close();
  }

  private async request(
    method: 'GET' | 'PUT' | 'POST',
    requestPath: string,
    params?: NamedObject,
  ): Promise<string | object | null> {
    await this.initializePage();
    if (!this.page) return null;

    const url = `${PROTOCOL}://${this.identifier}.${HOST}/api/${requestPath}`;
    const streams = Object.values(params || {}).filter(
      value => value && value.toString().match(/^file:\/\//),
    );
    const headers: NamedObject = {};

    if (method !== 'GET' && this.csrfToken) {
      headers['x-csrf-token'] = this.csrfToken;
    }

    if (params && streams.length) {
      const cookies = await this.page.cookies();
      const formData = new FormData();

      Object.keys(params).forEach(name => {
        const value = params[name];
        const filePath = value.toString().split('file://')[1];
        formData.append(name, filePath ? fs.createReadStream(filePath) : value);
      });

      await axios.post(url, formData, {
        headers: {
          Cookie: cookies
            .map(({ name, value }) => `${name}=${value};`)
            .join(' '),
          ...headers,
          ...formData.getHeaders(),
        },
      });

      return 'OK';
    }

    const requestId = Math.random()
      .toString(36)
      .substr(2, 9);

    let body: string | undefined;

    if (params) {
      headers['x-requested-with'] = 'XMLHttpRequest';
      headers['content-type'] = 'application/json';
      body = JSON.stringify(params);
    }

    this.requestParams[requestId] = { method, headers, body };

    const response = await this.page.goto(`${url}?reqId=${requestId}`);

    if (response) {
      const responseText = await response.text();
      const parseJson =
        response.headers()['content-type'] === 'application/json';
      return parseJson ? JSON.parse(responseText) : responseText;
    }

    return null;
  }

  private async initializePage(): Promise<void> {
    if (!this.page) {
      this.browser = await puppeteer.launch();
      this.page = await this.browser.newPage();

      await this.ensureLogin();
      await this.page.setRequestInterception(true);
      const { requestParams } = this;

      this.page.on('request', (req: puppeteer.Request) => {
        let overrides = {};
        const [url, requestId] = req.url().split('?reqId=');

        if (requestId) {
          const reqParams = requestParams[requestId];
          overrides = {
            url,
            method: reqParams.method,
            postData: reqParams.body,
            headers: {
              ...req.headers(),
              ...reqParams.headers,
            },
          };
          delete requestParams[requestId];
        }

        req.continue(overrides);
      });

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
    await this.page.goto(`${PROTOCOL}://${this.identifier}.${HOST}`);

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
