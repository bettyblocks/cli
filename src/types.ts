// eslint-disable import/prefer-default-export
export type Category = DefaultCategory | string;

export type CommandBB = 'login' | 'bundle' | 'components' | 'help';

export type CommandComponents =
  | 'add'
  | 'build'
  | 'generate'
  | 'help'
  | 'init'
  | 'install'
  | 'preview'
  | 'publish'
  | 'remove'
  | 'serve';

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
  type: string;
}

export interface ComponentReference {
  descendants: ComponentReference[];
  name: string;
  options: Option[];
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
  | 'NavItemIcon'
  | 'NavSidebarIcon'
  | 'NavbarIcon'
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
  configuration?: unknown;
  key: string;
  label: string;
  type: string;
  value: unknown;
}

export type Orientation = 'HORIZONTAL' | 'VERTICAL';

export interface Prefab {
  category: Category;
  icon: Icon;
  name: string;
  structure: ComponentReference[];
}

export interface Versions {
  remoteVersionCLI: string;
  remoteVersionPreview: string;
}

export interface Registry {
  data: RegistryEntry[];
}

export interface RegistryEntry {
  name: string;
  path?: string;
  public?: boolean;
  version: string;
}

export interface ComponentSet {
  prefabs: Prefab[];
  components: Component[];
}
