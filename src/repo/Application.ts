import { BaseModel } from './BaseModel';

export type ApplicationOptions = Record<string, unknown>;
export interface BwbOptions {
  allowInIframe?: string;
  contentSecurityPolicy?: string;
}

export interface ApplicationAttributes {
  id: string;
  identifier: string;
  name: string;
  options: string;
  bwbOptions: string;
}

export class Application extends BaseModel {
  public createdAt!: Date;

  public id!: string;

  public identifier!: string;

  public name!: string;

  public options!: ApplicationOptions;

  public updatedAt!: Date;

  public bwbOptions!: BwbOptions;
}
