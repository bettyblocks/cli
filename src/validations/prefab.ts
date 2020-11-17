/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */

import chalk from 'chalk';
import Joi, { ValidationResult } from 'joi';

import { ComponentReference, Prefab } from '../types';
import { findDuplicates } from '../utils/validation';
import {
  COMPARATORS,
  CONDITION_TYPE,
  CONFIGURATION_AS,
  ICONS,
  INTERACTION_TYPE,
  MODAL_TYPE,
  OPTIONS,
} from './constants';

const actionReferenceSchema = Joi.object({
  name: Joi.string().required(),
  ref: Joi.object({
    id: Joi.string().required(),
  }).required(),
  newRuntime: Joi.boolean().required(),
  steps: Joi.array().items(
    Joi.object({
      kind: Joi.string().required(),
    }),
  ),
});

// TODO: check if name is valid
// TODO: check if triggers are defined in components
// TODO: check if interaction component ref matches another ref

/*

interactions: [
  {
    name: string,
    type: Global | Custom,
    ref: {
      targetComponent: string (ref)
    },
    parameters?: [
      {
        name: string,
        ref: {
          componentId: string (ref)
        }
      }
    ]
  }
]

*/

const validateInteractionReferenceCommon = Joi.object({
  name: Joi.string().required(),
  ref: Joi.object({
    sourceComponent: Joi.string().required(),
    targetComponent: Joi.string().required(),
  }).required(),
  targetOptionName: Joi.string().required(),
  trigger: Joi.string().required(),
  type: Joi.string()
    .valid(INTERACTION_TYPE)
    .required(),
});

const validateInteractionReferenceParameters = {
  parameters: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      parameter: Joi.string().required(),
      ref: Joi.object({
        component: Joi.string().required(),
      }).required(),
    }),
  ),
};

const validateInteractionReference = Joi.alternatives().conditional(
  Joi.object({ type: Joi.valid('Global') }),
  {
    then: validateInteractionReferenceCommon.append(
      validateInteractionReferenceParameters,
    ),
    otherwise: validateInteractionReferenceCommon,
  },
);

// TODO: check ref based on option type
// TODO: check value based on option type
const componentReferenceSchema = Joi.object({
  name: Joi.string().required(),
  options: Joi.array()
    .items(
      Joi.object({
        value: Joi.any()
          .when('type', { is: 'FILTER', then: Joi.object() })
          .required(),
        ref: Joi.object(),
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
  interactions: Joi.array().items(validateInteractionReference),
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
