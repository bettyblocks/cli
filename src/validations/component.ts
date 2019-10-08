import Joi from '@hapi/joi';

import * as utils from '../utils/validation';
import { Component } from '../types';

export const schema = Joi.object({
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
  utils.validate(schema, components);
  utils.findDuplicates(components);
};
