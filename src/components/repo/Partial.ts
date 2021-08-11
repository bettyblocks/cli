import { BaseModel } from './BaseModel';

import { Component } from './Component';

export interface Partial extends BaseModel {
  id: string;

  applicationId: string;

  name: string;

  rootId: string;

  components: Component[];
}
