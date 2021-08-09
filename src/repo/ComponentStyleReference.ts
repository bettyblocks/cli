import { BaseModel } from './BaseModel';

export class ComponentStyleReference extends BaseModel {
  public id!: string;

  public applicationId!: string;

  public componentType!: string;

  public overwrite?: string | null;

  public componentId!: string;

  public styleId!: string;
}
