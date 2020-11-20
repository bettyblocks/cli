import Joi from 'joi';

import { EVENT_KIND } from '../constants';

export const actionSchema = Joi.object({
  events: Joi.array().items(
    Joi.object({
      kind: Joi.string()
        .valid(...EVENT_KIND)
        .required(),
    }),
  ),
  name: Joi.string().required(),
  newRuntime: Joi.boolean().required(),
  ref: Joi.object({
    id: Joi.string().required(),
  }).required(),
});
