import Joi from 'joi';

import { INTERACTION_TYPE } from '../constants';

const parametersSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.array()
    .items(
      Joi.alternatives()
        .try(
          Joi.object({
            name: Joi.string().required(),
            parameter: Joi.string().required(),
            ref: Joi.object({
              componentId: Joi.string().required(),
            }).required(),
          }),
          Joi.object({
            path: Joi.string().allow(null),
            parameter: Joi.string().required(),
            id: Joi.array()
              .items(Joi.string())
              .allow(null)
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
