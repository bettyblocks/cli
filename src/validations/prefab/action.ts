import Joi from 'joi';

import {
  EVENT_KIND,
  EVENT_KIND_NEW_RUNTIME,
  MAX_ACTION_EVENTS,
} from '../constants';

export const actionSchema = Joi.object({
  events: Joi.when('useNewRuntime', {
    is: true,
    then: Joi.array()
      .items(Joi.object({ kind: Joi.valid(EVENT_KIND_NEW_RUNTIME) }))
      .max(MAX_ACTION_EVENTS),
    otherwise: Joi.array()
      .items(Joi.object({ kind: Joi.valid(...EVENT_KIND) }))
      .max(MAX_ACTION_EVENTS),
  }),
  name: Joi.string().required(),
  useNewRuntime: Joi.boolean().required(),
  ref: Joi.object({
    id: Joi.string().required(),
    endpointId: Joi.string().required(),
  }).required(),
});
