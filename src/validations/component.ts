import Joi, { ObjectSchema } from '@hapi/joi';

import { findDuplicates, validate } from '../utils/validation';
import { Component } from '../types';

export const schema: ObjectSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string(),
  category: Joi.string(), // DEPRECATED
  type: Joi.string().required(),
  allowedTypes: Joi.array()
    .items(Joi.string())
    .required(),
  orientation: Joi.string().required(),
  jsx: Joi.any().required(),
  styles: Joi.any().required(),
});

export default (components: Component[]): void => {
  components.forEach((component: Component): void => {
    validate(schema, component);
  });

  findDuplicates(components);
};
