import { BaseModel } from './BaseModel';
import { Page } from './Page';

export interface ApplicationPageAttributes {
  id: string;
  applicationId: string;
  notFoundId: string;
}

export class ApplicationPage extends BaseModel {
  public id!: string;

  public applicationId!: string;

  public notFoundId!: string;

  public notFoundPage!: Page | null;
}
