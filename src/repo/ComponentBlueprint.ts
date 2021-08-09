import { BaseModel } from './BaseModel';

export class ComponentBlueprint extends BaseModel {
  public id!: string;

  public jsx!: string;

  public styles!: string;
}
