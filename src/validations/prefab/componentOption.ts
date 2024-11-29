import Joi from 'joi';

import {
  COMPARATORS,
  CONDITION_TYPE,
  CONFIGURATION_AS,
  INHERIT_TYPES,
  MEDIA_TYPES,
  MODAL_TYPE,
  OPTIONS,
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
      icon: Joi.string(),
    }),
  ),
  allowedTypes: Joi.array().items(Joi.string()),
  allowFormatting: Joi.boolean(),
  allowPropertyName: Joi.boolean(),
  allowRelations: Joi.boolean(),
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
  showOnDrop: Joi.boolean(),
  showTextStyleColor: Joi.boolean(),
  pushToWrapper: Joi.object({
    name: Joi.string().required(),
    condition: optionConditionSchema.optional(),
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
    allowedKinds: Joi.array().items(Joi.string()),
    allowedSplitButtonKinds: Joi.array().items(Joi.string()),
    allowedClickThroughKinds: Joi.array().items(Joi.string()),
    createProperty: Joi.object({
      type: Joi.string(),
      value: Joi.string().allow(''),
    }),
    createActionInputVariable: Joi.object({
      name: Joi.string(),
      type: Joi.string().required(),
      value: Joi.string().allow(''),
    }),
    manageObjectValues: Joi.object({
      selectableObjectKey: Joi.boolean().optional(),
      buttonLabel: Joi.string().optional(),
      label: Joi.string().optional(),
      value: Joi.array().items(Joi.object()),
    }),
  }),
  otherwise: Joi.object(optionConfigurationSchemaBase),
})
  .when('type', {
    is: 'ACTION_JS_VARIABLE',
    then: Joi.object({
      ...optionConfigurationSchemaBase,
      createActionInputVariable: Joi.object({
        name: Joi.string(),
        type: Joi.string().required(),
        value: Joi.string().allow(''),
      }),
    }),
  })
  .when('type', {
    is: 'VARIABLE',
    then: Joi.object({
      ...optionConfigurationSchemaBase,
      allowedKinds: Joi.array().items(Joi.string()),
      allowedSplitButtonKinds: Joi.array().items(Joi.string()),
      allowedClickThroughKinds: Joi.array().items(Joi.string()),
    }),
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
  .when('type', {
    is: 'ACTION_JS',
    then: Joi.object({
      ...optionConfigurationSchemaBase,
      createAction: Joi.object({
        name: Joi.string().optional(),
        permissions: Joi.string().optional(),
        template: Joi.string(),
        value: Joi.string().allow(''),
      }),
    }),
    otherwise: Joi.object(optionConfigurationSchemaBase),
  })

  .default({});

const OptionRefInheritObject = Joi.object({
  type: Joi.string().valid(...INHERIT_TYPES),
  name: Joi.string(),
  id: Joi.string(),
  useKey: Joi.string(),
});

const optionValueSchema = Joi.when('ref', {
  is: Joi.object({ value: Joi.exist() }).exist(),
  then: Joi.forbidden(),
  otherwise: Joi.any(),
}).when('type', {
  is: 'VARIABLE',
  then: Joi.array().items(Joi.string().allow('')).required(),
  otherwise: Joi.any(),
});

export const optionSchema = Joi.object({
  label: Joi.string().required(),
  key: Joi.string().required(),
  type: Joi.string()
    .valid(...OPTIONS)
    .required(),
  configuration: optionConfigurationSchema,
  value: optionValueSchema,
  showInAddChild: Joi.boolean(),
  showInReconfigure: Joi.boolean(),
  ref: refSchema,
  optionRef: Joi.object({
    id: Joi.string(),
    sourceId: Joi.string(),
    inherit: Joi.alternatives().try(
      Joi.string().valid('name', 'label', 'value'),
      OptionRefInheritObject,
      Joi.array().items(
        Joi.alternatives().try(Joi.string(), OptionRefInheritObject),
      ),
    ),
  }),
});

export const optionCategorySchema = Joi.object({
  label: Joi.string().required(),
  expanded: Joi.boolean(),
  members: Joi.array().items(Joi.string()).min(1).required(),
  condition: optionConditionSchema,
});
