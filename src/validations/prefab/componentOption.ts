import Joi from 'joi';

import {
  COMPARATORS,
  CONDITION_TYPE,
  CONFIGURATION_AS,
  MODAL_TYPE,
  OPTIONS,
  MEDIA_TYPES,
} from '../constants';

const refSchema = Joi.when('type', {
  is: 'ACTION',
  then: Joi.object({
    value: Joi.string().required(),
  }).when('value', {
    not: Joi.exist(),
    then: Joi.required(),
  }),
  otherwise: Joi.object({ id: Joi.string() }),
});

const optionConditionSchema = Joi.object({
  type: Joi.string().valid(...CONDITION_TYPE),
  option: Joi.string(),
  comparator: Joi.string().valid(...COMPARATORS),
  value: Joi.any(),
});

const optionConfigurationSchemaBase = {
  apiVersion: Joi.string()
    .pattern(/^v[\d]{1,}/)
    .default('v1'),
  allowedInput: Joi.array().items(
    Joi.object({
      name: Joi.string().allow(''),
      value: Joi.alternatives().try(Joi.boolean(), Joi.string(), Joi.number()),
    }),
  ),
  allowedTypes: Joi.array().items(Joi.string()),
  as: Joi.string().valid(...CONFIGURATION_AS),
  component: Joi.string(),
  condition: optionConditionSchema,
  disabled: Joi.boolean(),
  dataType: Joi.string(),
  dependsOn: Joi.string(),
  placeholder: Joi.string(),
  modal: Joi.object({
    type: Joi.string().valid(...MODAL_TYPE),
    generateCustomModel: Joi.boolean(),
    modelRequired: Joi.boolean(),
  }),
};

const optionConfigurationSchema = Joi.when('type', {
  is: 'PROPERTY',
  then: Joi.object({
    ...optionConfigurationSchemaBase,
    apiVersion: Joi.string()
      .pattern(/^v[\d]{1,}/)
      .invalid('v1')
      .default('v2')
      .messages({
        'any.invalid': 'API version 1 is no longer supported.',
      }),
  }),
  otherwise: Joi.object(optionConfigurationSchemaBase),
})
  .when('type', {
    is: 'PUBLIC_FILE',
    then: Joi.object({
      ...optionConfigurationSchemaBase,
      mediaType: Joi.string().valid(...MEDIA_TYPES),
      allowedExtensions: Joi.alternatives().conditional('mediaType', {
        is: 'VIDEO',
        then: Joi.array().items(
          Joi.string().regex(/(^video)(\/)[a-zA-Z0-9_]*/m),
        ),
        otherwise: Joi.array().items(
          Joi.string().regex(/(^image)(\/)[a-zA-Z0-9_]*/m),
        ),
      }),
    }),
  })

  .default({});

export const optionSchema = Joi.object({
  label: Joi.string().required(),
  key: Joi.string().required(),
  type: Joi.string()
    .valid(...OPTIONS)
    .required(),
  configuration: optionConfigurationSchema,
  value: Joi.when('ref', {
    is: Joi.object({ value: Joi.exist() }).exist(),
    then: Joi.forbidden(),
    otherwise: Joi.any(),
  }),
  ref: refSchema,
});

export const optionCategorySchema = Joi.object({
  label: Joi.string().required(),
  expanded: Joi.boolean(),
  members: Joi.array().items(Joi.string()).min(1).required(),
  condition: optionConditionSchema,
});
