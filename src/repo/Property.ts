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

export class Property extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public id!: string;

  public kind!: string;

  public modelId!: string;

  public name!: string;

  public options!: PropertyOptions;

  public updatedAt!: Date;
}
