import defaultTheme from './defaultTheme';
import { BaseModel } from './BaseModel';

export interface Theme extends BaseModel {
  applicationId: string;

  createdAt: Date;

  id: string;

  name: string;

  options: typeof defaultTheme;

  updatedAt: Date;
}
