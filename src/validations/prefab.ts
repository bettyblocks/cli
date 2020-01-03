/* eslint-disable no-use-before-define */

/* eslint-disable @typescript-eslint/no-use-before-define */
import Joi, { ValidationResult } from '@hapi/joi';

import { ComponentReference, Prefab } from '../types';
import { findDuplicates } from '../utils/validation';
import { CONDITION_TYPE, ICONS, TYPES } from './constants';

const componentReferenceSchema = Joi.object({
  name: Joi.string().required(),
  options: Joi.array()
    .items(
      Joi.object({
        value: Joi.any().required(),
        label: Joi.string().required(),
        key: Joi.string().required(),
        // Array spread is done because of this issue: https://github.com/hapijs/joi/issues/1449#issuecomment-532576296
        type: Joi.string()
          .valid(...TYPES)
          .required(),
        configuration: Joi.object({
          allowedInput: Joi.array().items(
            Joi.object({
              name: Joi.string().allow(''),
              value: Joi.string(),
            }),
          ),
          as: Joi.string(),
          component: Joi.string(),
          condition: Joi.object({
            // Array spread is done because of this issue: https://github.com/hapijs/joi/issues/1449#issuecomment-532576296
            type: Joi.string().valid(...CONDITION_TYPE),
            option: Joi.string(),
            comparator: Joi.string(),
            value: Joi.any(),
          }),
          dataType: Joi.string(),
          dependsOn: Joi.string(),
          placeholder: Joi.string(),
        }),
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
  // Array spread is done because of this issue: https://github.com/hapijs/joi/issues/1449#issuecomment-532576296
  icon: Joi.string()
    .valid(...ICONS)
    .required(),
  category: Joi.string().required(),
  structure: Joi.array()
    .items(validateComponentReference)
    .required(),
});

const validate = (prefab: Prefab): void => {
  const { error }: ValidationResult = schema.validate(prefab);

  if (typeof error !== 'undefined') {
    throw new Error(`Property: ${error.message} at prefab: ${prefab.name}`);
  }
};

const validateOptions = ({ structure, name }: Prefab): void => {
  const innerValidateOptions = ({
    options,
    descendants,
  }: ComponentReference): void => {
    const keys: string[] = [];

    options.forEach(({ key }) => {
      if (keys.includes(key)) {
        throw new Error(
          `Multiple option references to key: ${key} in prefab: ${name}`,
        );
      }

      keys.push(key);
    });

    descendants.map(innerValidateOptions);
  };

  structure.map(innerValidateOptions);
};

export default (prefabs: Prefab[]): void => {
  prefabs.forEach((prefab: Prefab): void => {
    validate(prefab);
    validateOptions(prefab);
  });

  findDuplicates(prefabs, 'prefab');
};
