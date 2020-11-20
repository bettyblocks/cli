import Joi from 'joi';

import { EVENT_KIND, EVENT_KIND_NEW_RUNTIME } from '../constants';

export const actionSchema = Joi.object({
  events: Joi.when('useNewRuntime', {
    is: true,
    then: Joi.array().items(
      Joi.object({ kind: Joi.valid(EVENT_KIND_NEW_RUNTIME) }),
    ),
    otherwise: Joi.array().items(
      Joi.object({ kind: Joi.valid(...EVENT_KIND) }),
    ),
  }),
  name: Joi.string().required(),
  useNewRuntime: Joi.boolean().required(),
  ref: Joi.object({
    id: Joi.string().required(),
  }).required(),
});
