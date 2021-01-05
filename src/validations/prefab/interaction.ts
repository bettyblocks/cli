import Joi from 'joi';

import { INTERACTION_TYPE } from '../constants';

const parametersSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.array()
    .items(
      Joi.object({
        parameter: Joi.string().required(),
        name: Joi.string(),
        ref: Joi.object({
          componentId: Joi.string().required(),
        }),
        path: Joi.array().items(Joi.string()),
        id: Joi.array().items(Joi.string()),
      })
        .xor('name', 'path', 'id')
        .with('name', 'ref'),
    )
    .required(),
  otherwise: Joi.forbidden(),
});

const targetOptionNameSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.string().required(),
  otherwise: Joi.forbidden(),
});

export const interactionSchema = Joi.object({
  name: Joi.string().required(),
  ref: Joi.object({
    sourceComponentId: Joi.string().required(),
    targetComponentId: Joi.string().required(),
  }).required(),
  targetOptionName: targetOptionNameSchema,
  sourceEvent: Joi.string().required(),
  type: Joi.string()
    .valid(...INTERACTION_TYPE)
    .required(),
  parameters: parametersSchema,
});
