import { BaseModel } from './BaseModel';
import { Page } from './Page';

export interface ApplicationPageAttributes {
  id: string;
  applicationId: string;
  notFoundId: string;
}

export interface ApplicationPage extends BaseModel {
  id: string;

  applicationId: string;

  notFoundId: string;

  notFoundPage: Page | null;
}
