export type Category = DefaultCategory | string;

export type CommandBB =
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
  | 'preview'
  | 'help'
  | 'generate';

export type CommandFunctions = 'init' | 'build' | 'publish';

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

export interface PrefabComponent {
  actions?: PrefabAction[];
  descendants: PrefabComponent[];
  name: string;
  options: PrefabComponentOption[];
  ref?: {
    id: string;
  };
}

export type Icon =
  | 'AccordionIcon'
  | 'AccordionItemIcon'
  | 'AlertIcon'
  | 'AutoCompleteIcon'
  | 'BreadcrumbIcon'
  | 'BreadcrumbItemIcon'
  | 'ButtonGroupIcon'
  | 'ButtonIcon'
  | 'CheckboxIcon'
  | 'Column2Icon'
  | 'Column3Icon'
  | 'ColumnIcon'
  | 'ContainerIcon'
  | 'DataContainer'
  | 'DataTable'
  | 'DataTableBody'
  | 'DataTableColumn'
  | 'DataTableHead'
  | 'DataTableRow'
  | 'DatePickerIcon'
  | 'DateTimePickerIcon'
  | 'DefinitionListIcon'
  | 'DynamicFormIcon'
  | 'DynamicTableIcon'
  | 'DynamicTilesIcon'
  | 'EmailInputIcon'
  | 'FileInputIcon'
  | 'FormIcon'
  | 'GridIcon'
  | 'HiddenInputIcon'
  | 'HorizontalRuleIcon'
  | 'HtmlIcon'
  | 'IbanInputIcon'
  | 'IconIcon'
  | 'ImageIcon'
  | 'ImageInputIcon'
  | 'IncludeIcon'
  | 'LabelIcon'
  | 'Layout1Icon'
  | 'Layout2Icon'
  | 'Layout3333Icon'
  | 'Layout363Icon'
  | 'Layout444Icon'
  | 'Layout48Icon'
  | 'Layout66Icon'
  | 'Layout84Icon'
  | 'LogoutIcon'
  | 'ListItemIcon'
  | 'MultiLineIcon'
  | 'MultiSelectIcon'
  | 'NavbarIcon'
  | 'NavItemIcon'
  | 'NavSidebarIcon'
  | 'NumberInputIcon'
  | 'OrderedListIcon'
  | 'PanelIcon'
  | 'ParagraphIcon'
  | 'PasswordInputIcon'
  | 'PhoneInputIcon'
  | 'PriceInputIcon'
  | 'ProgressBarIcon'
  | 'RadioButtonIcon'
  | 'RowColumnIcon'
  | 'RowIcon'
  | 'SelectIcon'
  | 'SubmitButtonIcon'
  | 'TabGroupIcon'
  | 'Table'
  | 'TextInputIcon'
  | 'TextareaIcon'
  | 'TimePickerIcon'
  | 'TitleIcon'
  | 'UnorderedListIcon'
  | 'UrlInputIcon';

export type ValueConfig = Record<string, unknown>;

export interface PrefabComponentOptionBase {
  label: string;
  key: string;
  type: string;
  configuration?: unknown;
}

export interface ValueDefault {
  value: string | ValueConfig;
}

export interface ValueRef {
  ref: {
    value: string;
  };
}

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
  icon: Icon;
  interactions?: PrefabInteraction[];
  structure: PrefabComponent[];
  variables?: PrefabVariable[];
  type?: string;
  description?: string;
}

export enum InteractionType {
  Custom = 'Custom',
  Global = 'Global',
}

interface BasePrefabInteraction<T extends InteractionType> {
  name: string;
  ref: {
    sourceComponentId: string;
    targetComponentId: string;
  };
  targetOptionName: string;
  sourceEvent: string;
  type: T;
}

interface ParameterOptionWithId {
  parameter: string;
  id: string[];
}

interface ParameterOptionWithPath {
  path: string[];
  parameter: string;
}

interface ParameterOptionWithComponentRef {
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
  | BasePrefabInteraction<InteractionType.Global> & {
      parameters: PrefabInteractionParameter[];
    };

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

interface PrefabActionAssign {
  leftHandSide: string;
  ref: {
    path: string[];
  };
}

interface PrefabActionUpdateStepOption {
  ref: {
    object: string;
    customModel?: string;
  };
  assign: PrefabActionAssign[];
}

interface PrefabActionCreateStepOption {
  modelId: string;
  assign: PrefabActionAssign[];
  ref: {
    customModel: string;
  };
}

interface PrefabActionDeleteStepOption {
  ref: {
    object: string;
    customModel: string;
  };
}

interface AuthenticateUserStepOption {
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
