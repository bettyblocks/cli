import Joi from 'joi';

import { INTERACTION_TYPE } from '../constants';

const baseParameterSchema = Joi.object().keys({
  parameter: Joi.string().required(),
});

const parametersSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.array()
    .items(
      Joi.alternatives()
        .try(
          baseParameterSchema.keys({
            name: Joi.string().required(),
            ref: Joi.object({
              componentId: Joi.string().required(),
            }).required(),
          }),
          baseParameterSchema.keys({
            path: Joi.string().required(),
          }),
          baseParameterSchema.keys({
            id: Joi.array()
              .items(Joi.string())
              .required(),
          }),
        )
        .required(),
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
