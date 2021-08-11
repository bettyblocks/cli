import { BaseModel } from './BaseModel';

export interface Variable extends BaseModel {
  id: string;

  inputVariable: boolean;

  kind: string;

  name: string;

  options: object;
}
