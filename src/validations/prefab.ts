/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Joi, { ValidationResult } from 'joi';
import chalk from 'chalk';

import { Prefab, ComponentReference } from '../types';
import {
  ICONS,
  OPTIONS,
  CONDITION_TYPE,
  COMPARATORS,
  MODAL_TYPE,
} from './constants';
import { findDuplicates } from '../utils/validation';

const componentReferenceSchema = Joi.object({
  name: Joi.string().required(),
  options: Joi.array()
    .items(
      Joi.object({
        value: Joi.any()
          .when('type', { is: 'FILTER', then: Joi.object() })
          .required(),
        label: Joi.string().required(),
        key: Joi.string().required(),
        // Array spread is done because of this issue: https://github.com/hapijs/joi/issues/1449#issuecomment-532576296
        type: Joi.string()
          .valid(...OPTIONS)
          .required(),
        configuration: Joi.object({
          apiVersion: Joi.string(),
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
            comparator: Joi.string().valid(...COMPARATORS),
            value: Joi.any(),
          }),
          dataType: Joi.string(),
          dependsOn: Joi.string(),
          placeholder: Joi.string(),
          modal: Joi.object({
            type: Joi.string().valid(...MODAL_TYPE),
            generateCustomModel: Joi.boolean(),
            modelRequired: Joi.boolean(),
          }),
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

    throw new Error(chalk.red(`\nBuild error in prefab ${name}: ${message}\n`));
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
    .items(Joi.custom(validateComponentReference))
    .required(),
});

const validate = (prefab: Prefab): void => {
  const { error }: ValidationResult = schema.validate(prefab);

  if (typeof error !== 'undefined') {
    throw new Error(
      chalk.red(`\nProperty: ${error.message} at prefab: ${prefab.name}\n`),
    );
  }
};

const validateOptions = ({ structure, name }: Prefab): void => {
  const innerValidateOptions = ({
    options,
    descendants,
  }: ComponentReference): void => {
    const keys: string[] = [];

    options.forEach(({ key }) => {
      if (keys.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
        throw new Error(
          chalk.red(
            `\nMultiple option references to key: ${key} in prefab: ${name}\n`,
          ),
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
