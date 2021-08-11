import { BaseModel } from './BaseModel';
import { Component } from './Component';
import { Endpoint } from './Endpoint';

export interface Page extends BaseModel {
  id: string;

  applicationId: string;

  name: string;

  rootId: string;

  components: Component[];

  endpoint: Endpoint;

  endpointId: string;
}
