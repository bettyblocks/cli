import Joi from 'joi';
import { COMPARATORS, CONDITION_TYPE, CONFIGURATION_AS } from '../constants';

const linkedOptionValueSchema = Joi.object({
  ref: Joi.object({
    componentId: Joi.string().required(),
    optionId: Joi.string().optional(),
  }),
});

export const linkedOptionConfigurationSchema = Joi.object({
  as: Joi.string().valid(...CONFIGURATION_AS),
  dataType: Joi.string(),
  allowedInput: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      value: Joi.alternatives().try(Joi.boolean(), Joi.string(), Joi.number()),
    }),
  ),
  condition: Joi.object({
    type: Joi.string().valid(...CONDITION_TYPE),
    option: Joi.string(),
    comparator: Joi.string().valid(...COMPARATORS),
    value: Joi.any(),
  }),
});

export const linkedOptionSchema = Joi.object({
  key: Joi.string().required(),
  label: Joi.string().allow(''),
  type: Joi.string().valid('LINKED_OPTION').required(),
  value: linkedOptionValueSchema,
  configuration: linkedOptionConfigurationSchema,
});
