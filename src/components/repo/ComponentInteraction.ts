import { BaseModel } from './BaseModel';

export enum ComponentInteractionType {
  Custom = 'Custom',
  Global = 'Global',
  Login = 'Login',
  Toggle = 'Toggle',
}

export enum SpecialEvent {
  Blur = 'Blur',
  Change = 'Change',
  Click = 'Click',
  Focus = 'Focus',
  Submit = 'Submit',
  Success = 'Success',
}

export const specialEvents = [
  SpecialEvent.Blur,
  SpecialEvent.Change,
  SpecialEvent.Click,
  SpecialEvent.Focus,
  SpecialEvent.Submit,
  SpecialEvent.Success,
];

export const isSpecialEvent = (event: string): boolean =>
  specialEvents.includes(event as SpecialEvent);

export const isCustomInteraction = (
  interaction: ComponentInteraction,
): interaction is ComponentInteractionCustom =>
  interaction.type === ComponentInteractionType.Custom;

export const isGlobalInteraction = (
  interaction: ComponentInteraction,
): interaction is ComponentInteractionGlobal =>
  interaction.type === ComponentInteractionType.Global;

export const isToggleInteraction = (
  interaction: ComponentInteraction,
): interaction is ComponentInteractionToggle =>
  interaction.type === ComponentInteractionType.Toggle;

export const isLoginInteraction = (
  interaction: ComponentInteraction,
): interaction is ComponentInteractionLogin =>
  interaction.configuration.sourceEvent === 'Success' &&
  interaction.type === ComponentInteractionType.Login;

export interface BaseConfiguration {
  sourceEvent: string;
}

export interface HasTargetOptionName {
  targetOptionName: string;
}

export interface CustomConfiguration extends BaseConfiguration {
  name: string;
  parameters: Parameter[];
}

export type ToggleConfiguration = BaseConfiguration & HasTargetOptionName;

export interface LoginConfiguration extends BaseConfiguration {
  endpointId: string;
}

export interface PropertyIdArgument {
  id: string;
  parameter: string;
  resolveValue: boolean;
  operator: string;
}

export interface PropertyPathArgument {
  path: string[];
  parameter: string;
}

export interface OptionArgument {
  componentId: string;
  name: string;
  parameter: string;
}

export interface PageArgumentParameters {
  name: string;
  value: string[];
}

export interface PageArgument {
  pageId: string;
  parameter: string;
  parameters: PageArgumentParameters[];
}

type PropertyOrPath = PropertyIdArgument | PropertyPathArgument;
export type Parameter = OptionArgument | PropertyOrPath | PageArgument;

export interface GlobalConfiguration
  extends BaseConfiguration,
    HasTargetOptionName {
  function: (...args: unknown[]) => unknown;
  name: string;
  parameters: Parameter[];
}

export type ComponentInteractionCustom = BaseComponentInteraction<
  ComponentInteractionType.Custom
>;
export type ComponentInteractionGlobal = BaseComponentInteraction<
  ComponentInteractionType.Global
>;
export type ComponentInteractionLogin = BaseComponentInteraction<
  ComponentInteractionType.Login
>;
export type ComponentInteractionToggle = BaseComponentInteraction<
  ComponentInteractionType.Toggle
>;

export type ComponentInteractionTypes =
  | ComponentInteractionCustom
  | ComponentInteractionGlobal
  | ComponentInteractionLogin
  | ComponentInteractionToggle;

export interface BaseComponentInteraction<
  Type extends ComponentInteractionType
> extends BaseModel {
  id: string;

  applicationId: string;

  configuration: Type extends ComponentInteractionType.Global
    ? GlobalConfiguration
    : Type extends ComponentInteractionType.Custom
    ? CustomConfiguration
    : Type extends ComponentInteractionType.Login
    ? LoginConfiguration
    : Type extends ComponentInteractionType.Toggle
    ? ToggleConfiguration
    : never;

  sourceComponentId: string;

  targetComponentId: string;

  type: Type;
}

export type ComponentInteraction = BaseComponentInteraction<
  ComponentInteractionType
>;
