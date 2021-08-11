import { BaseModel } from './BaseModel';

export enum StyleType {
  BUTTON = 'button',
  TEXT = 'text',
}

export interface ColorReference {
  type: 'THEME_COLOR' | 'STATIC';
  value:
    | 'primary'
    | 'secondary'
    | 'black'
    | 'dark'
    | 'medium'
    | 'light'
    | 'white'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'accent1'
    | 'accent2'
    | 'accent3';
}

export type Reference = ColorReference;

export interface TextStyle {
  color: string | Reference;
  __type__: StyleType.TEXT;
}

export interface ButtonStyle {
  color: string | Reference;
  backgroundColor: string | Reference;
  borderColor: string | Reference;
  borderRadius: string[];
  borderStyle: string;
  borderWidth: string[];
  boxShadow: string;
  __type__: StyleType.BUTTON;
}

export type ComponentStyleContent = TextStyle | ButtonStyle;

export interface ComponentStyle extends BaseModel {
  id: string;

  name: string;

  applicationId: string;

  componentType: string;

  content: ComponentStyleContent;
}
