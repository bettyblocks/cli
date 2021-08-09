import { BaseModel } from './BaseModel';

export interface ModelOptions {
  allowImport?: boolean;
  allowMassDelete?: boolean;
  autoComplete?: boolean;
  isSettingsModel?: boolean;
  label: string;
  logMutations?: boolean;
  schemaPosition?: {
    x: number;
    y: number;
  };
}

export type ModelPermissionsRoleMap = {
  [roleId: string]: 'true' | 'false';
};

export interface ModelPermissions {
  create: ModelPermissionsRoleMap;
  destroy: ModelPermissionsRoleMap;
  export: ModelPermissionsRoleMap;
  read: ModelPermissionsRoleMap;
  update: ModelPermissionsRoleMap;
}

export class Model extends BaseModel {
  public applicationId!: string;

  public createdAt!: Date;

  public helpText?: string | null;

  public id!: string;

  public name!: string;

  public options!: ModelOptions;

  public permissions?: ModelPermissions;

  public tableName!: string;

  public updatedAt!: Date;
}
