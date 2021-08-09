import { BaseModel } from './BaseModel';

import { Component } from './Component';

export class Partial extends BaseModel {
  public id!: string;

  public applicationId!: string;

  public name!: string;

  public rootId!: string;

  public components!: Component[];
}
