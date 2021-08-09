import { BaseModel } from './BaseModel';

export class TranslationLocale extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public updatedAt!: Date;

  public id!: string;

  public name!: string;

  public locale!: string;

  public default!: boolean;
}
