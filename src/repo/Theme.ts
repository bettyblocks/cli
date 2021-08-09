import defaultTheme from './defaultTheme';
import { BaseModel } from './BaseModel';

export class Theme extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public id!: string;

  public name!: string;

  public options!: typeof defaultTheme;

  public updatedAt!: Date;
}
