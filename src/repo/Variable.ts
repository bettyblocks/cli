import { BaseModel } from './BaseModel';

export class Variable extends BaseModel {
  public id!: string;

  public inputVariable!: boolean;

  public kind!: string;

  public name!: string;

  public options!: object;
}
