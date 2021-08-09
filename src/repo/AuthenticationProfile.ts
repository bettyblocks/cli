import { BaseModel } from './BaseModel';
import { Endpoint } from './Endpoint';

export interface AuthenticationProfileOptions {
  expireSessionTimeout: string;
  loginModel: string;
  loginVariable: string;
  redirectEndpoint?: string;
}

export class AuthenticationProfile extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public id!: string;

  public kind!: string;

  public name!: string;

  public options!: AuthenticationProfileOptions;

  public redirectEndpoint!: Endpoint | null;

  public updatedAt!: Date;
}
