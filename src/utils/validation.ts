import { ComponentProps, PrefabProps, PartialProps } from '../types';
import Joi, { ValidationErrorItem } from '@hapi/joi';

export const componentSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string(),
  category: Joi.string(),
  type: Joi.string().required(),
  allowedTypes: Joi.array()
    .items(Joi.string())
    .required(),
  orientation: Joi.string().required(),
  jsx: Joi.any().required(),
  styles: Joi.any().required(),
});

export const prefabSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().required(),
  category: Joi.string(),
  structure: Joi.array().required(),
});

export const partialSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().required(),
  category: Joi.string(),
  structure: Joi.array(),
});

export const validateDuplicateNames: (
  components: (ComponentProps | PrefabProps)[],
) => void = (components: (ComponentProps | PrefabProps)[]): void => {
  const names: { [name: string]: number } = components.reduce(
    (acc: { [name: string]: number }, { name }: { name: string }) => ({
      ...acc,
      [name]: acc[name] + 1 || 1,
    }),
    {},
  );
  const duplicateNames = Object.keys(names).filter(
    (name: string): boolean => names[name] > 1,
  );
  if (duplicateNames.length !== 0) {
    throw new Error(
      ` The following component(s) have duplicate name(s): ${duplicateNames}`,
    );
  }
};
export const validatePrefabStructure = (prefabs: PrefabProps[]) => {
  prefabs.forEach((prefab: PrefabProps) => {
    const { error } = prefabSchema.validate(prefab);
    if (typeof error !== 'undefined') {
      const { details } = error;
      const { name } = prefab;
      details.forEach(detail => {
        throw new Error(`Prefab: "${name}" has an error: "${detail.message}"`);
      });
    }
  });
};

export const validateComponentStructure = (components: ComponentProps[]) => {
  components.forEach((component: ComponentProps) => {
    const { error } = componentSchema.validate(component);
    if (typeof error !== 'undefined') {
      const { details } = error;
      const { name } = component;
      details.forEach(detail => {
        throw new Error(
          `Component: "${name}" has an error: "${detail.message}"`,
        );
      });
    }
  });
};

export const validatePartialStructure = (partial: PartialProps[]) => {
  partial.forEach((partial: PartialProps) => {
    const { error } = partialSchema.validate(partial);
    if (typeof error !== 'undefined') {
      const { details } = error;
      const { name } = partial;
      details.forEach((detail: ValidationErrorItem) => {
        throw new Error(`Partial: "${name}" has an error: "${detail.message}"`);
      });
    }
  });
};
