import { BaseModel } from './BaseModel';
import { Page } from './Page';
import { ENDPOINTS } from './tableNames';

export class Endpoint extends BaseModel {
  public id!: string;

  public createdAt!: Date;

  public updatedAt!: Date;

  public authenticationProfileId!: string | null;

  public applicationId!: string;

  public url!: string;

  public online!: boolean;

  public page!: Page;

  static tableName = ENDPOINTS;
}
