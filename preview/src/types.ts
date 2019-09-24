export interface ComponentContextProps {
  components?: ComponentRaw[];
}

export interface ComponentRaw {
  allowedTypes: string[];
  category: string;
  icon: string;
  id: string;
  jsx: string;
  name: string;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  styles: Function;
  type: string;
}

export interface ComponentConfiguration {
  descendants: ComponentConfiguration[];
  id?: string;
  name: string;
  options: OptionRaw[];
}

export interface OptionsMap {
  [key: string]: OptionRaw[];
}

export interface OptionRaw {
  id?: string;
  key: string;
  label: string;
  type: string;
  value: string;
}

export interface PrefabContextProps {
  errorMessage?: string;
  options: OptionsMap;
  prefabs: PrefabRaw[];
  prodMode: boolean;
  records?: string;
  selectedPrefab: PrefabRaw;
  setOptions: (options: OptionsMap) => void;
  setProdMode?: (prodMode: boolean) => void;
  setSelectedPrefab?: (prefab: PrefabRaw) => void;
  stateMode?: 'error' | 'loading' | 'success' | string;
}

export interface PrefabRaw {
  category: string;
  icon: string;
  name?: string;
  structure: ComponentConfiguration[];
  type?: string;
}
