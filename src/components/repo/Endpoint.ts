import { BaseModel } from './BaseModel';
import { Page } from './Page';

export interface Endpoint extends BaseModel {
  id: string;

  createdAt: Date;

  updatedAt: Date;

  authenticationProfileId: string | null;

  applicationId: string;

  url: string;

  online: boolean;

  page: Page;
}
