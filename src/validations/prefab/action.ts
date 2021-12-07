import Joi from 'joi';

import {
  EVENT_KIND,
  EVENT_KIND_NEW_RUNTIME,
  MAX_ACTION_EVENTS,
} from '../constants';

const assignSchema = Joi.object({
  leftHandSide: Joi.string().required(),
  ref: Joi.object({
    path: Joi.array().items(Joi.string()),
  }),
});

export const actionSchema = Joi.object({
  events: Joi.when('useNewRuntime', {
    is: true,
    then: Joi.array()
      .items(
        Joi.object({
          kind: Joi.valid(EVENT_KIND_NEW_RUNTIME),
          options: Joi.when('kind', {
            switch: [
              {
                is: 'authenticate_user',
                then: Joi.object({
                  authenticationProfileId: Joi.string().allow('').required(),
                  ref: Joi.object({
                    username: Joi.string().required(),
                    password: Joi.string().required(),
                    jwtAs: Joi.string().required(),
                  }),
                }),
              },
            ],
            otherwise: Joi.forbidden(),
          }),
        }),
      )
      .max(MAX_ACTION_EVENTS),
    otherwise: Joi.array()
      .items(
        Joi.object({
          kind: Joi.valid(...EVENT_KIND),
          options: Joi.when('kind', {
            switch: [
              {
                is: 'update',
                then: Joi.object({
                  ref: Joi.object({
                    object: Joi.string().required(),
                  }),
                  assign: Joi.array().items(assignSchema),
                }),
              },
              {
                is: 'create',
                then: Joi.object({
                  modelId: Joi.string().allow('').required(),
                  assign: Joi.array().items(assignSchema),
                  ref: Joi.object({
                    customModel: Joi.string().required(),
                  }),
                }),
              },
              {
                is: 'delete',
                then: Joi.object({
                  ref: Joi.object({
                    object: Joi.string().required(),
                  }),
                }),
              },
              {
                is: 'action',
                then: Joi.object({
                  assign: Joi.array().items(assignSchema),
                  ref: Joi.object({
                    modelAction: Joi.string().required(),
                    resultAs: Joi.string(),
                  }),
                }),
              },
            ],
            otherwise: Joi.forbidden(),
          }),
        }),
      )
      .max(MAX_ACTION_EVENTS),
  }),
  name: Joi.string(),
  options: Joi.object({
    ref: Joi.object({
      result: Joi.string().required(),
    }),
  }),
  useNewRuntime: Joi.boolean().required(),
  ref: Joi.when('useNewRuntime', {
    is: false,
    then: Joi.object({
      id: Joi.string().required(),
      endpointId: Joi.string().required(),
    }),
    otherwise: Joi.object({
      id: Joi.string().required(),
    }),
  }).required(),
});
