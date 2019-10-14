// eslint-disable-next-line import/prefer-default-export
export enum Orientation {
  Vertical = 'VERTICAL',
  Horizontal = 'HORIZONTAL',
}

export interface Component {
  name: string;
  type: string;
  allowedTypes: string[];
  orientation: Orientation;
  jsx: string;
  styles: string;
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
