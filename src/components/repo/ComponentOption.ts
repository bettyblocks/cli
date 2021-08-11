import { Action } from './Action';
import { BaseModel } from './BaseModel';
import { Component } from './Component';

export interface AllowedInput {
  icon: string | null;
  iconScale: number | null;
  name: string | null;
  value: string | null;
}

export interface Condition {
  comparator: 'EQ';
  option: string;
  type: 'HIDE' | 'SHOW';
  value: string | null;
}

export interface ComponentOptionConfiguration {
  apiVersion: 'v1' | 'v2' | null;
  as: string | null;
  component: string | null;
  dataType: string | null;
  dependsOn: string | null;
  displayKeys: (string | null)[] | null;
  placeholder: string | null;
  query: string | null;
  allowedTypes: (string | null)[] | null;
  allowedInput: (AllowedInput | null)[] | null;
  condition: Condition | null;
}

export interface ComponentOption extends BaseModel {
  action: Action;

  id: string;

  applicationId: string;

  componentId: string;

  key: string;

  value: string;

  type: string;

  configuration: ComponentOptionConfiguration;

  component: Component;
}
