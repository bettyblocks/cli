/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Joi from '@hapi/joi';

import * as utils from '../utils/validation';
import { Prefab } from '../types';

const componentRefSchema = Joi.object({
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
    .items(Joi.custom(validateComponentRef))
    .required(),
});

function validateComponentRef(prefab: Prefab): Prefab {
  const { error } = componentRefSchema.validate(prefab);

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
    .items(validateComponentRef)
    .required(),
});

export default (prefabs: Prefab[]): void => {
  utils.validate(schema, prefabs);
  utils.findDuplicates(prefabs);
};
