import { BaseModel } from './BaseModel';

export interface TranslationLocale extends BaseModel {
  applicationId: string;

  createdAt: Date;

  updatedAt: Date;

  id: string;

  name: string;

  locale: string;

  default: boolean;
}
