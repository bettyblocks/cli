import Joi, { ObjectSchema, ValidationResult } from '@hapi/joi';

import { Component } from '../types';
import { findDuplicates } from '../utils/validation';

const schema: ObjectSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string(), // DEPRECATED
  category: Joi.string(), // DEPRECATED
  type: Joi.string().required(),
  allowedTypes: Joi.array()
    .items(Joi.string())
    .required(),
  orientation: Joi.string().required(),
  jsx: Joi.any().required(),
  styles: Joi.any().required(),
});

const validate = (component: Component): void => {
  const { error }: ValidationResult = schema.validate(component);

  if (typeof error !== 'undefined') {
    throw new Error(
      `Property: ${error.message} at component: ${component.name}`,
    );
  }
};

export default (components: Component[]): void => {
  components.forEach((component: Component): void => {
    validate(component);
  });

  findDuplicates(components, 'component');
};
