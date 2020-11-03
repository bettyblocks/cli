// eslint-disable import/prefer-default-export
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
  name: string;
  type: string;
  allowedTypes: string[];
  orientation: Orientation;
  jsx: string;
  styles: string;
}

export interface ComponentReference {
  name: string;
  actions?: Action[];
  options: Option[];
  descendants: ComponentReference[];
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

export interface Option {
  value: string | ValueConfig;
  label: string;
  key: string;
  type: string;
  configuration?: unknown;
}

export interface ValueConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type Orientation = 'VERTICAL' | 'HORIZONTAL';

export interface Prefab {
  beforeCreate?: string;
  category: Category;
  name: string;
  icon: Icon;
  structure: ComponentReference[];
}

export interface Interaction {
  name: string;
  function: string;
}

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

export interface Action {
  name: string;
  id: string;
  newRuntime: boolean;
  steps: ActionStep[];
}

export interface ActionStep {
  kind: string;
}
