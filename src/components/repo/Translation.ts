import { BaseModel } from './BaseModel';

export interface Translation extends BaseModel {
  applicationId: string;

  createdAt: Date;

  updatedAt: Date;

  id: string;

  key: string;
}
