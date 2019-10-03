export type ComponentProps = {
  name: string;
  type: string;
  allowedTypes: [];
  orientation: string;
  jsx: string;
  style: string;
};

export type PrefabProps = {
  name: string;
  icon: string;
  category: string;
  structure: [];
};

export type PartialProps = {
  name: string;
  icon: string;
  category: string;
  structure: [];
};
