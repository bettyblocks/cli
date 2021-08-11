import { BaseModel } from './BaseModel';

export interface PropertyOptions {
  applyDefaultWhenBlank?: boolean;
  defaultValue?: {
    type: string;
    value: unknown;
  };
  indexed?: boolean;
  label: string;
  model?: string;
  values?: { value: string }[];
  validatesByExpressions?: unknown[];
  validatesPresence?: boolean;
  validatesUniqueness?: boolean;
  pageBuilderFormat?: string;
}

export interface Property extends BaseModel {
  applicationId: string;

  createdAt: Date;

  id: string;

  kind: string;

  modelId: string;

  name: string;

  options: PropertyOptions;

  updatedAt: Date;
}
