import { ComponentProps, PrefabProps } from '../types';

const REQUIRED_COMPONENT_PROPS = [
  'name',
  'type',
  'allowedTypes',
  'orientation',
  'jsx',
  'styles',
];
const REQUIRED_PREFABS_PROPS = ['name', 'icon', 'category', 'structure'];

export const getDuplicateNames: (
  components: (ComponentProps | PrefabProps)[],
) => string[] = (components: (ComponentProps | PrefabProps)[]): string[] => {
  const names: { [name: string]: number } = components.reduce(
    (acc: { [name: string]: number }, { name }: { name: string }) => ({
      ...acc,
      [name]: acc[name] + 1 || 1,
    }),
    {},
  );

  return Object.keys(names).filter((name: string): boolean => names[name] > 1);
};

export const checkRequiredProps = (
  components: (ComponentProps | PrefabProps)[],
  type: string,
): string[] => {
  const REQUIRED_PROPERTIES: string[] =
    type === 'component' ? REQUIRED_COMPONENT_PROPS : REQUIRED_PREFABS_PROPS;

  const propertiesMissing: string[] = components
    .map((component: ComponentProps | PrefabProps) =>
      REQUIRED_PROPERTIES.filter(reqProp =>
        !component.hasOwnProperty(reqProp) ? reqProp : '',
      ),
    )
    .reduce((acc, missingProps) => [...acc, ...missingProps]);

  return propertiesMissing;
};
