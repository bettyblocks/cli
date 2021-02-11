import Joi from 'joi';
import { INTERACTION_TYPE } from '../constants';

const parametersSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.array()
    .items(
      Joi.object({
        parameter: Joi.string().required(),
        name: Joi.string().required(),
        ref: Joi.object({
          componentId: Joi.string().required(),
        }).required(),
      }),
    )
    .required(),
  otherwise: Joi.forbidden(),
});

const targetOptionNameSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.string(),
  otherwise: Joi.forbidden(),
});

const targetComponentIdSchema = Joi.when('type', {
  is: 'Custom',
  then: Joi.string().required(),
});

export const interactionSchema = Joi.object({
  name: Joi.string().required(),
  ref: Joi.object({
    sourceComponentId: Joi.string().required(),
    targetComponentId: targetComponentIdSchema,
  }).required(),
  targetOptionName: targetOptionNameSchema,
  sourceEvent: Joi.string().required(),
  type: Joi.string()
    .valid(...INTERACTION_TYPE)
    .required(),
  parameters: parametersSchema,
});
