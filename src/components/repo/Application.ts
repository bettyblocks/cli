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

export interface Application extends BaseModel {
  createdAt: Date;

  id: string;

  identifier: string;

  name: string;

  options: ApplicationOptions;

  updatedAt: Date;

  bwbOptions: BwbOptions;
}
