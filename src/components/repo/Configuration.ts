import { BaseModel } from './BaseModel';

export interface ConfigurationSettings {
  value?: string;
}

export interface Configuration extends BaseModel {
  applicationId: string;

  createdAt: Date;

  id: string;

  kind: string;

  name: string;

  settings: ConfigurationSettings;

  updatedAt: Date;
}
