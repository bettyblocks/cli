import Joi from 'joi';
import { COMPARATORS, CONDITION_TYPE, CONFIGURATION_AS } from '../constants';

const linkedPartialValueSchema = Joi.object({
  ref: Joi.object({
    componentId: Joi.string().required(),
  }),
});

export const linkedPartialConfigurationSchema = Joi.object({
  as: Joi.string().valid(...CONFIGURATION_AS),
  condition: Joi.object({
    type: Joi.string().valid(...CONDITION_TYPE),
    option: Joi.string(),
    comparator: Joi.string().valid(...COMPARATORS),
    value: Joi.any(),
  }),
});

export const linkedPartialSchema = Joi.object({
  key: Joi.string().required(),
  label: Joi.string().allow(''),
  type: Joi.string().valid('LINKED_PARTIAL').required(),
  value: linkedPartialValueSchema,
  configuration: linkedPartialConfigurationSchema,
});
