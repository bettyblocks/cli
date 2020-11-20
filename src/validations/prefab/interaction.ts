import Joi from 'joi';

import { INTERACTION_TYPE } from '../constants';

const parametersSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        parameter: Joi.string().required(),
        ref: Joi.object({
          component: Joi.string().required(),
        }).required(),
      }),
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
    sourceComponent: Joi.string().required(),
    targetComponent: Joi.string().required(),
  }).required(),
  targetOptionName: targetOptionNameSchema,
  sourceEvent: Joi.string().required(),
  type: Joi.string()
    .valid(...INTERACTION_TYPE)
    .required(),
  parameters: parametersSchema,
});
