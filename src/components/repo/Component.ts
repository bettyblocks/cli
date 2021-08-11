import { BaseModel } from './BaseModel';

export interface Component extends BaseModel {
  jsx: string;

  styles: string;
}
