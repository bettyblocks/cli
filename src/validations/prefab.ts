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
  CONFIGURATION_AS,
} from './constants';
import { findDuplicates } from '../utils/validation';

const actionReferenceSchema = Joi.object({
  name: Joi.string().required(),
  id: Joi.string().required(),
  newRuntime: Joi.boolean().required(),
  steps: Joi.array().items(
    Joi.object({
      kind: Joi.string().required(),
    }),
  ),
});

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
          allowedTypes: Joi.array().items(Joi.string()),
          as: Joi.string().valid(...CONFIGURATION_AS),
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

function validateActionReference(prefab: Prefab): Prefab {
  const { error } = actionReferenceSchema.validate(prefab);

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
  actions: Joi.array().items(Joi.custom(validateActionReference)),
  beforeCreate: Joi.any(),
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

const validateOptions = ({ structure, name, actions }: Prefab): void => {
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

    if (actions) {
      const actionIds = actions.map(action => action.id);
      options
        .filter(
          option => option.type === 'ACTION' || option.type === 'FORM_DATA',
        )
        .forEach(option => {
          const errorMessage = `\nInvalid reference to value in option: ${
            option.key
          } in prefab: ${name}\n the possible options are [${actionIds.toString()}]`;
          if (typeof option.value === 'string' && option.value) {
            if (!actionIds.includes(option.value)) {
              throw new Error(chalk.red(errorMessage));
            }
          } else if (
            typeof option.value === 'object' &&
            option.value &&
            option.value.actionId
          ) {
            if (!actionIds.includes(option.value.actionId)) {
              throw new Error(chalk.red(errorMessage));
            }
          }
        });
    }

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
