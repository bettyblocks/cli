import Joi from '@hapi/joi';
import * as utils from '../utils/validation';
import { Component } from '../types';

export const schema = Joi.object({
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

export const validateSchema = (components: Component[]) =>
  utils.validate('component', schema, components);
