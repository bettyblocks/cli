import Joi from '@hapi/joi';
import * as utils from '../utils/validation';
import { Partial } from '../types';

const schema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().required(),
  category: Joi.string(),
  structure: Joi.array(),
});

export const validateSchema = (partials: Partial[]) =>
  utils.validate('partial', schema, partials);
