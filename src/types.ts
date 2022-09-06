import { ICONS } from './validations/constants';

export type Category = DefaultCategory | string;

export type CommandBB =
  | 'blocks'
  | 'components'
  | 'functions'
  | 'interactions'
  | 'bundle'
  | 'help';

export type CommandComponents =
  | 'create'
  | 'build'
  | 'serve'
  | 'publish'
  | 'help'
  | 'generate';

export type CommandFunctions =
  | 'init'
  | 'login'
  | 'logout'
  | 'new'
  | 'build'
  | 'publish'
  | 'validate'
  | 'autoversion'
  | 'bump'
  | 'test';

export type CommandBlocks = 'publish' | 'new';

export type CommandInteractions = 'generate';

export type CommandBundle = 'init';

export type DefaultCategory =
  | 'CONTENT'
  | 'DATA'
  | 'FORM'
  | 'LAYOUT'
  | 'NAVIGATION'
  | 'TABLE';

export interface Component {
  allowedTypes: string[];
  jsx: string;
  name: string;
  orientation: Orientation;
  styles: string;
  styleType: string;
  type: string;
}

export type PrefabReference = PrefabComponent | PrefabPartial | PrefabWrapper;

export type PrefabPartial = {
  type: 'PARTIAL';
  partialId: string;
};

export type PrefabWrapper = {
  type: 'WRAPPER';
  descendants: PrefabReference[];
  optionCategories?: PrefabComponentOptionCategory[];
  options: PrefabComponentOption[];
};
export interface PrefabComponent {
  type?: 'COMPONENT';
  actions?: PrefabAction[];
  name: string;
  style?: {
    name?: string;
    overwrite?: {
      backgroundColor?: {
        value: string;
        type: string;
      };
      borderColor?: {
        value: string;
        type: string;
      };
      borderRadius?: string | string[];
      borderStyle?: string;
      borderWidth?: string | string[];
      boxShadow?: string;
      color?: {
        value: string;
        type: string;
      };
      fontFamily?: string;
      fontSize?: string;
      fontStyle?: string;
      fontWeight?: string;
      letterSpacing?: string;
      lineHeight?: string;
      padding?: string | string[];
      textDecoration?: string;
      textTransform?: string;
    };
  };
  descendants: PrefabReference[];
  optionCategories?: PrefabComponentOptionCategory[];
  options: PrefabComponentOption[];
  ref?: {
    id: string;
  };
}

export type ComponentStyleMap = Record<
  PrefabComponent['name'],
  { styleType: Component['styleType'] }
>;

export type Icon = typeof ICONS[number];

export type ValueConfig = Record<string, unknown>;

export interface PrefabComponentOptionBase {
  label: string;
  key: string;
  type: string;
  configuration?: unknown;
}

export interface ValueDefault {
  value: string | ValueConfig;
  ref?: { id?: string };
}

export interface ValueRef {
  ref: {
    id?: string;
    value: string;
  };
}

export type PrefabComponentOptionCategory = {
  label: string;
  extended?: boolean;
  members: string[];
  condition?: {
    type: string;
    option: string;
    comparator: string;
    value: string | boolean | number;
  };
};

export type PrefabComponentOption = PrefabComponentOptionBase &
  (ValueDefault | ValueRef);

export type Orientation = 'VERTICAL' | 'HORIZONTAL';

export enum InteractionOptionType {
  Boolean = 'Boolean',
  Number = 'Number',
  String = 'String',
  Event = 'Event',
  Void = 'Void',
  Page = 'Page',
  Locale = 'Locale',
}

// TODO: Add support
export enum InteractionOptionTypeToDo {
  Color = 'Color',
  Endpoint = 'Endpoint',
  Filter = 'Filter',
  Font = 'Font',
  Properties = 'Properties',
  Property = 'Property',
  Size = 'Size',
  Unit = 'Unit',
}

export interface InteractionCompatibility {
  name: string;
  parameters: Record<string, InteractionOptionType>;
  type: InteractionOptionType;
}

export interface Interaction extends InteractionCompatibility {
  function: string;
}

export interface Prefab {
  actions?: PrefabAction[];
  beforeCreate?: string;
  category: Category;
  name: string;
  keywords?: string[];
  icon: Icon;
  interactions?: PrefabInteraction[];
  structure: PrefabReference[];
  variables?: PrefabVariable[];
  type?: string;
  description?: string;
}

export enum InteractionType {
  Custom = 'Custom',
  Global = 'Global',
}

export interface BasePrefabInteraction<T extends InteractionType> {
  name: string;
  ref: {
    sourceComponentId: string;
    targetComponentId?: string;
  };
  targetOptionName: string;
  sourceEvent: string;
  type: T;
}

export interface ParameterOptionWithId {
  parameter: string;
  id: string[];
}

export interface ParameterOptionWithPath {
  path: string[];
  parameter: string;
}

export interface ParameterOptionWithComponentRef {
  name: string;
  parameter: string;
  ref: {
    componentId: string;
  };
}

export type PrefabInteractionParameter =
  | ParameterOptionWithId
  | ParameterOptionWithPath
  | ParameterOptionWithComponentRef;

export type PrefabInteraction =
  | BasePrefabInteraction<InteractionType.Custom>
  | (BasePrefabInteraction<InteractionType.Global> & {
      parameters: PrefabInteractionParameter[];
    });

export interface Versions {
  remoteVersionCLI: string;
  remoteVersionPreview: string;
}

export interface ServeOptions {
  rootDir: string;
  host: string;
  port: number;
  ssl: boolean;
  sslCert: string;
  sslKey: string;
  transpile?: boolean;
}

export interface PrefabAction {
  name: string;
  ref: {
    id: string;
    endpointId?: string;
  };
  options?: {
    ref: {
      result: string;
    };
  };
  useNewRuntime: boolean;
  events?: PrefabActionStep[];
}

export interface PrefabActionAssign {
  leftHandSide: string;
  ref: {
    path: string[];
  };
}

export interface PrefabActionUpdateStepOption {
  ref: {
    object: string;
    customModel?: string;
  };
  assign: PrefabActionAssign[];
}

export interface PrefabActionCreateStepOption {
  modelId: string;
  assign: PrefabActionAssign[];
  ref: {
    customModel: string;
  };
}

export interface PrefabActionDeleteStepOption {
  ref: {
    object: string;
    customModel: string;
  };
}

export interface AuthenticateUserStepOption {
  authenticationProfileId: string;
  ref: {
    username: string;
    password: string;
    jwtAs: string;
  };
}

export interface PrefabActionStep {
  kind: string;
  options?:
    | PrefabActionUpdateStepOption
    | PrefabActionCreateStepOption
    | PrefabActionDeleteStepOption
    | AuthenticateUserStepOption;
}

export type PrefabVariableKind = 'construct' | 'object' | 'string';

export interface PrefabVariable {
  kind: PrefabVariableKind;
  name: string;
  ref: {
    actionId?: string;
    endpointId?: string;
    id: string;
  };
  options?: unknown;
}
