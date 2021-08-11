import injectInteractions from './inject';
import { Component, ComponentInteraction } from './repo';

export interface ComponentDeclaration {
  interactions: string;
  jsx: string;
  name: string;
  sourceInteractions: ComponentInteraction[];
  styles: string;
}

export type ComponentDeclarationMap = Record<string, ComponentDeclaration>;

export const componentDeclarations = (
  components: Component[],
): ComponentDeclarationMap => {
  const declarations: ComponentDeclarationMap = {};

  let nameCount = 0;

  components.forEach(
    ({ jsx, styles, sourceInteractions, targetInteractions }) => {
      const interactions = injectInteractions(
        sourceInteractions,
        targetInteractions,
      );

      const key = jsx + styles + interactions;

      if (typeof declarations[key] === 'undefined') {
        // eslint-disable-next-line no-plusplus
        nameCount++;

        declarations[key] = {
          interactions,
          jsx,
          name: `__SECRET_COMPONENT_DO_NOT_USE_${nameCount}`,
          sourceInteractions,
          styles,
        };
      }
    },
  );

  return declarations;
};
