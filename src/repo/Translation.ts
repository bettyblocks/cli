import { BaseModel } from './BaseModel';

export class Translation extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public updatedAt!: Date;

  public id!: string;

  public key!: string;
}
