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

export interface Model extends BaseModel {
  applicationId: string;

  createdAt: Date;

  helpText?: string | null;

  id: string;

  name: string;

  options: ModelOptions;

  permissions?: ModelPermissions;

  tableName: string;

  updatedAt: Date;
}
