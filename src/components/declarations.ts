import { Component } from './repo';

export interface ComponentDeclaration {
  jsx: string;
  name: string;
  styles: string;
}

export type ComponentDeclarationMap = Record<string, ComponentDeclaration>;

export const componentDeclarations = (
  components: Component[],
): ComponentDeclarationMap => {
  const declarations: ComponentDeclarationMap = {};

  let nameCount = 0;

  components.forEach(({ jsx, styles }) => {
    const key = jsx + styles;

    if (typeof declarations[key] === 'undefined') {
      // eslint-disable-next-line no-plusplus
      nameCount++;

      declarations[key] = {
        jsx,
        name: `__SECRET_COMPONENT_DO_NOT_USE_${nameCount}`,
        styles,
      };
    }
  });

  return declarations;
};
