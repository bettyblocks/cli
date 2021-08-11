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

export interface CustomModelAttribute extends BaseModel {
  applicationId: string;

  createdAt: Date;

  id: string;

  kind: string;

  constructId: string;

  name: string;

  updatedAt: Date;

  options: CustomModelAttributeOptions;

  property?: Property;
}
