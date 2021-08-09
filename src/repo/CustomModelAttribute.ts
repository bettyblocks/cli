import { BaseModel } from './BaseModel';
import { Property } from './Property';

export interface CustomModelAttributeOptions {
  constructId?: string;
  modelId?: string;
  propertyId?: string;
  validatesPresenceOf?: boolean;
  validatesAssociated?: boolean;
  inheritValidations?: boolean;
  validatesPresence?: boolean;
  validatesByExpression?: string;
  validatesByExpressions?: string[];
  validatesFormatOf?: string;
  validatesGreaterThan?: bigint;
  validatesInclusionOf?: string[];
  validatesLessThan?: bigint;
  validatesMaxLength?: bigint;
  validatesMinLength?: bigint;
}

export class CustomModelAttribute extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public id!: string;

  public kind!: string;

  public constructId!: string;

  public name!: string;

  public updatedAt!: Date;

  public options!: CustomModelAttributeOptions;

  public property?: Property;
}
