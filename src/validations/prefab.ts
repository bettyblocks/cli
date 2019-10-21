/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Joi from '@hapi/joi';

import { findDuplicates, validate } from '../utils/validation';
import { Prefab } from '../types';

const componentReferenceSchema = Joi.object({
  name: Joi.string().required(),
  options: Joi.array()
    .items(
      Joi.object({
        value: Joi.any().required(),
        label: Joi.string().required(),
        key: Joi.string().required(),
        type: Joi.string().required(),
        configuration: Joi.object(),
      }),
    )
    .required(),
  descendants: Joi.array()
    .items(Joi.custom(validateComponentReference))
    .required(),
});

function validateComponentReference(prefab: Prefab): Prefab {
  const { error } = componentReferenceSchema.validate(prefab);

  if (typeof error !== 'undefined') {
    const { name } = prefab;
    const { message } = error;

    throw new Error(`Build error in prefab ${name}: ${message}`);
  }

  return prefab;
}

const schema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().required(),
  category: Joi.string().required(),
  structure: Joi.array()
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    .items(validateComponentReference)
    .required(),
});

export default (prefabs: Prefab[]): void => {
  prefabs.forEach((prefab: Prefab): void => {
    validate(schema, prefab);
  });

  findDuplicates(prefabs);
};
