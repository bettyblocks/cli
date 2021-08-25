import { BaseModel } from './BaseModel';

export interface Component extends BaseModel {
  jsx: string;
  transpiled: string;
  styles: string;
}
