import { BaseModel } from './BaseModel';

export interface ComponentStyleReference extends BaseModel {
  id: string;

  applicationId: string;

  componentType: string;

  overwrite?: string | null;

  componentId: string;

  styleId: string;
}
