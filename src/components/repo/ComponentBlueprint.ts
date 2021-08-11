import { BaseModel } from './BaseModel';

export interface ComponentBlueprint extends BaseModel {
  id: string;

  jsx: string;

  styles: string;
}
