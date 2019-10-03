export interface Component {
  name: string;
  type: string;
  allowedTypes: [];
  orientation: string;
  jsx: string;
  style: string;
}

export interface Option {
  value: unknown;
  label: string;
  key: string;
  type: string;
  configuration?: unknown;
}

export interface ComponentRef {
  name: string;
  options: Option[];
  descendants: ComponentRef[];
}

export interface Prefab {
  name: string;
  icon: string;
  category: string;
  structure: ComponentRef[];
}

export interface Partial extends Prefab {}
