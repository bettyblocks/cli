import { Component } from '../../repo/Component';
import {
  ComponentStyle,
  ComponentStyleContent,
  Theme,
  Reference,
} from '../../repo';
import defaultTheme from '../../repo/defaultTheme';

export const toComponentMap = (
  components: Component[],
): Record<string, Component> =>
  components.reduce(
    (
      map: Record<string, Component>,
      component: Component,
    ): Record<string, Component> => {
      const descendants = components
        .filter(({ parentId }: Component) => component.id === parentId)
        .sort(({ index: a }: Component, { index: b }: Component) => a - b)
        .map(({ id }: Component) => id);

      return {
        ...map,
        [component.id]: {
          ...component,
          descendants,
        },
      } as Record<string, Component>;
    },
    {},
  );

const getThemeValue = (theme: Theme, { type, value }: Reference): string => {
  const themeValues = (theme && theme.options) || defaultTheme;

  switch (type) {
    case 'THEME_COLOR':
      return (themeValues && themeValues.colors)[value] || '';
    case 'STATIC':
      return value;
    default:
      throw new TypeError(`The provided type "${type}" is not supported!`);
  }
};

// check if received value is a theme reference
const isReference = (field: string | string[] | Reference): boolean => {
  return typeof field === 'object' && field !== null && !Array.isArray(field);
};

export const convertThemeValues = (
  style: ComponentStyleContent,
  theme: Theme,
): ComponentStyleContent => {
  const converted = Object.entries(style).reduce(
    (acc, [key, current]) => {
      const val = isReference(current)
        ? getThemeValue(theme, current)
        : current;

      return {
        ...acc,
        [key]: val,
      };
    },
    {} as ComponentStyleContent,
  );

  return converted;
};

export const toStyleMap = (
  styles: ComponentStyle[],
): Record<string, ComponentStyleContent> => {
  return styles.reduce(
    (acc: Record<string, ComponentStyleContent>, { id, content }) => ({
      ...acc,
      [id]: content,
    }),
    {},
  );
};
