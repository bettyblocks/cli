import Joi from 'joi';

import { VARIABLE_KIND } from '../constants';

export const variableKindSchema = Joi.when('kind', {
  switch: [
    {
      is: 'construct',
      then: Joi.object({
        modelId: Joi.string().allow('').required(),
        ref: Joi.object({
          customModelId: Joi.string().required(),
        }).required(),
      }),
    },
    {
      is: 'object',
      then: Joi.object({
        modelId: Joi.string().allow('').required(),
      }),
    },
  ],
  otherwise: Joi.forbidden(),
});

export const variableSchema = Joi.object({
  name: Joi.string().allow('').required(),
  kind: Joi.string()
    .valid(...VARIABLE_KIND)
    .required(),
  pageId: Joi.string().allow(''),
  ref: Joi.object({
    id: Joi.string().required(),
    endpointId: Joi.string(),
    actionId: Joi.string(),
  }).required(),
  options: variableKindSchema,
});
