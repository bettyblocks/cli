import fs from 'fs-extra';
import path from 'path';

import IDE from '../utils/ide';

export type Config = {
  schemaUrl: string;
  functionSchemaPath: string;
  cacheDir: string;
  fusionAuthUrl: string;
  builderApiUrl: string;
  domain: string;
  identifier: string;
  host: string;
  zone: string;
  applicationId: string;
};

const fusionAuthUrl = (defaultUrl: string, zone: string): string => {
  let postfix = '';
  if (zone === 'acceptance') {
    postfix = '-ca';
  } else if (zone === 'edge') {
    postfix = '-ce';
  }

  return defaultUrl.replace('{ZONEPOSTFIX}', postfix);
};

const builderApiUrl = (defaultUrl: string, host: string): string =>
  defaultUrl.replace('{HOST}', host);

const configPath = path.join(process.cwd(), 'config.json');

const readConfig = (): Config => fs.readJsonSync(configPath) as Config;

const updateConfig = (config: Config): Config => {
  fs.writeJsonSync(configPath, config, { spaces: 2, EOL: '\n' });
  return config;
};

const fetchApplicationId = async (config: Config): Promise<string> => {
  const ide = new IDE(config);
  await ide.get('/');
  await ide.webhead.get('/');
  const text: string = ide.webhead.text() || '';
  const uuid = (text.match(/Betty\.application_id = '([0-9a-f]+)'/) || [])[1];
  return uuid;
};

const setApplicationId = async (): Promise<Config> => {
  const config = readConfig();

  if (!config.applicationId) {
    config.applicationId = await fetchApplicationId(config);
  }

  return updateConfig(config);
};

const initConfig = async (): Promise<Config> => {
  const config = readConfig();
  let identifier;
  let zone;
  let zonePostfix;

  if (!config.identifier) {
    [identifier, zone] = path.basename(process.cwd()).split('.');
    console.log('Setting identifier: ', identifier);
    config.identifier = identifier;
  }

  if (!config.zone) {
    console.log('Setting zone: ', zone);
    config.zone = zone || 'production';
  }

  if (!config.host) {
    if (zone !== 'production') {
      zonePostfix = zone;
    }
    const host = `https://${[
      config.identifier,
      zonePostfix,
      config.domain,
    ].join('.')}`;
    console.log('Setting host: ', host);
    config.host = host;
  }

  config.fusionAuthUrl = fusionAuthUrl(config.fusionAuthUrl, config.zone);
  config.builderApiUrl = builderApiUrl(config.builderApiUrl, config.host);

  return updateConfig(config);
};

export { initConfig, readConfig, updateConfig, setApplicationId };
