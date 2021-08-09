import { BaseModel } from './BaseModel';
import { Component } from './Component';
import { Endpoint } from './Endpoint';
import { PAGES } from './tableNames';

export class Page extends BaseModel {
  public id!: string;

  public applicationId!: string;

  public name!: string;

  public rootId!: string;

  public components!: Component[];

  public endpoint!: Endpoint;

  public endpointId!: string;

  static tableName = PAGES;
}
