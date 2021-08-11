import { BaseModel } from './BaseModel';
import { Endpoint } from './Endpoint';

export interface AuthenticationProfileOptions {
  expireSessionTimeout: string;
  loginModel: string;
  loginVariable: string;
  redirectEndpoint?: string;
}

export interface AuthenticationProfile extends BaseModel {
  applicationId: string;

  createdAt: Date;

  id: string;

  kind: string;

  name: string;

  options: AuthenticationProfileOptions;

  redirectEndpoint: Endpoint | null;

  updatedAt: Date;
}
