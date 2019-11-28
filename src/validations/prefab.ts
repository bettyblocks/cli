/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Joi, { ValidationResult } from '@hapi/joi';

import { findDuplicates } from '../utils/validation';
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

const validate = <T extends { name: string }>(item: T): void => {
  const { error }: ValidationResult = schema.validate(item);

  if (typeof error !== 'undefined') {
    throw new Error(`Property: ${error.message} at prefab: ${item.name}`);
  }
};

export default (prefabs: Prefab[]): void => {
  prefabs.forEach((prefab: Prefab): void => {
    validate(prefab);
  });

  findDuplicates(prefabs, 'prefab');
};
