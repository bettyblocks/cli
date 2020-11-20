/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
// Array spread is done because of this issue: https://github.com/hapijs/joi/issues/1449#issuecomment-532576296

import chalk from 'chalk';
import Joi, { ValidationResult } from 'joi';

import { Prefab, PrefabComponent } from '../types';
import { findDuplicates } from '../utils/validation';
import {
  COMPARATORS,
  CONDITION_TYPE,
  CONFIGURATION_AS,
  EVENT_KIND,
  ICONS,
  INTERACTION_TYPE,
  MODAL_TYPE,
  OPTIONS,
} from './constants';

const actionSchema = Joi.object({
  events: Joi.array().items(
    Joi.object({
      kind: Joi.string()
        .valid(...EVENT_KIND)
        .required(),
    }),
  ),
  name: Joi.string().required(),
  newRuntime: Joi.boolean().required(),
  ref: Joi.object({
    id: Joi.string().required(),
  }).required(),
});

const variableSchema = Joi.object({
  kind: Joi.string()
    .valid('construct')
    .required(),
  modelId: Joi.string()
    .allow('')
    .required(),
  name: Joi.string().required(),
  ref: Joi.object({
    actionId: Joi.string().required(),
    customModelId: Joi.string().required(),
  }).required(),
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
        parameter: string,
        ref: {
          componentId: string (ref)
        }
      }
    ]
  }
]

*/

const interactionParametersSchema = Joi.when('type', {
  is: 'Global',
  then: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        parameter: Joi.string().required(),
        ref: Joi.object({
          component: Joi.string().required(),
        }).required(),
      }),
    )
    .required(),
  otherwise: Joi.forbidden(),
});

const interactionSchema = Joi.object({
  name: Joi.string().required(),
  ref: Joi.object({
    sourceComponent: Joi.string().required(),
    targetComponent: Joi.string().required(),
  }).required(),
  targetOptionName: Joi.string().required(),
  trigger: Joi.string().required(),
  type: Joi.string()
    .valid(...INTERACTION_TYPE)
    .required(),
  parameters: interactionParametersSchema,
});

const refSchema = Joi.when('type', {
  is: 'ACTION',
  then: Joi.object({
    value: Joi.string().required(),
  }).when('value', {
    not: Joi.exist(),
    then: Joi.required(),
  }),
  otherwise: Joi.forbidden(),
});

const valueSchema = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string()
    .allow('')
    .required(),
  Joi.object().required(),
);

const optionConfigurationSchema = Joi.object({
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
});

const optionSchema = Joi.object({
  label: Joi.string().required(),
  key: Joi.string().required(),
  type: Joi.string()
    .valid(...OPTIONS)
    .required(),
  configuration: optionConfigurationSchema,
  value: Joi.when('ref', {
    is: Joi.exist(),
    then: Joi.forbidden(),
    otherwise: valueSchema,
  }),
  ref: refSchema,
});

// TODO: check ref based on option type
// TODO: check value based on option type
const componentSchema = Joi.object({
  name: Joi.string().required(),
  options: Joi.array()
    .items(optionSchema)
    .required(),
  descendants: Joi.array()
    .items(Joi.custom(validateComponent))
    .required(),
});

function validateComponent(component: PrefabComponent): Prefab | unknown {
  const { error } = componentSchema.validate(component);

  if (typeof error !== 'undefined') {
    const { name } = component;
    const { message } = error;

    throw new Error(
      chalk.red(`\nBuild error in component ${name}: ${message}\n`),
    );
  }

  return component;
}

const schema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string()
    .valid(...ICONS)
    .required(),
  category: Joi.string().required(),
  interactions: Joi.array().items(interactionSchema),
  actions: Joi.array().items(actionSchema),
  variables: Joi.array().items(variableSchema),
  beforeCreate: Joi.any(),
  structure: Joi.array()
    .items(Joi.custom(validateComponent))
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
  }: PrefabComponent): void => {
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
