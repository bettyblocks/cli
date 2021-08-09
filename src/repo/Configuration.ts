import { BaseModel } from './BaseModel';

export interface ConfigurationSettings {
  value?: string;
}

export class Configuration extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public id!: string;

  public kind!: string;

  public name!: string;

  public settings!: ConfigurationSettings;

  public updatedAt!: Date;
}
