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

export enum Icon {
  AccordionIcon = 'AccordionIcon',
  AccordionItemIcon = 'AccordionItemIcon',
  AlertIcon = 'AlertIcon',
  AutoCompleteIcon = 'AutoCompleteIcon',
  BreadcrumbIcon = 'BreadcrumbIcon',
  BreadcrumbItemIcon = 'BreadcrumbItemIcon',
  ButtonGroupIcon = 'ButtonGroupIcon',
  ButtonIcon = 'ButtonIcon',
  CheckboxIcon = 'CheckboxIcon',
  Column2Icon = 'Column2Icon',
  Column3Icon = 'Column3Icon',
  ColumnIcon = 'ColumnIcon',
  ContainerIcon = 'ContainerIcon',
  DataContainer = 'DataContainer',
  DataTable = 'DataTable',
  DataTableBody = 'DataTableBody',
  DataTableColumn = 'DataTableColumn',
  DataTableHead = 'DataTableHead',
  DataTableRow = 'DataTableRow',
  DatePickerIcon = 'DatePickerIcon',
  DateTimePickerIcon = 'DateTimePickerIcon',
  DefinitionListIcon = 'DefinitionListIcon',
  DynamicFormIcon = 'DynamicFormIcon',
  DynamicTableIcon = 'DynamicTableIcon',
  DynamicTilesIcon = 'DynamicTilesIcon',
  EmailInputIcon = 'EmailInputIcon',
  FileInputIcon = 'FileInputIcon',
  FormIcon = 'FormIcon',
  GridIcon = 'GridIcon',
  HiddenInputIcon = 'HiddenInputIcon',
  HorizontalRuleIcon = 'HorizontalRuleIcon',
  HtmlIcon = 'HtmlIcon',
  IbanInputIcon = 'IbanInputIcon',
  IconIcon = 'IconIcon',
  ImageIcon = 'ImageIcon',
  ImageInputIcon = 'ImageInputIcon',
  IncludeIcon = 'IncludeIcon',
  LabelIcon = 'LabelIcon',
  Layout1Icon = 'Layout1Icon',
  Layout2Icon = 'Layout2Icon',
  Layout3333Icon = 'Layout3333Icon',
  Layout363Icon = 'Layout363Icon',
  Layout444Icon = 'Layout444Icon',
  Layout48Icon = 'Layout48Icon',
  Layout66Icon = 'Layout66Icon',
  Layout84Icon = 'Layout84Icon',
  ListItemIcon = 'ListItemIcon',
  MultiLineIcon = 'MultiLineIcon',
  MultiSelectIcon = 'MultiSelectIcon',
  NavbarIcon = 'NavbarIcon',
  NavItemIcon = 'NavItemIcon',
  NavSidebarIcon = 'NavSidebarIcon',
  NumberInputIcon = 'NumberInputIcon',
  OrderedListIcon = 'OrderedListIcon',
  PanelIcon = 'PanelIcon',
  ParagraphIcon = 'ParagraphIcon',
  PasswordInputIcon = 'PasswordInputIcon',
  PhoneInputIcon = 'PhoneInputIcon',
  PriceInputIcon = 'PriceInputIcon',
  ProgressBarIcon = 'ProgressBarIcon',
  RadioButtonIcon = 'RadioButtonIcon',
  RowColumnIcon = 'RowColumnIcon',
  RowIcon = 'RowIcon',
  SelectIcon = 'SelectIcon',
  SubmitButtonIcon = 'SubmitButtonIcon',
  TabGroupIcon = 'TabGroupIcon',
  Table = 'Table',
  TextInputIcon = 'TextInputIcon',
  TextareaIcon = 'TextareaIcon',
  TimePickerIcon = 'TimePickerIcon',
  TitleIcon = 'TitleIcon',
  UnorderedListIcon = 'UnorderedListIcon',
  UrlInputIcon = 'UrlInputIcon',
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
  icon: Icon;
  category: string;
  structure: ComponentRef[];
}
