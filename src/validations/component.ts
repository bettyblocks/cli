import chalk from 'chalk';
import Joi, { ObjectSchema, ValidationResult } from 'joi';

import { Component } from '../types';
import { findDuplicates } from '../utils/validation';

import { STYLE_REFERENCE_TYPES } from './constants';

const reservedTypes = (value: string) => {
  if (value === 'PARTIAL' || value === 'WRAPPER') {
    throw new Error(
      chalk.red(
        `\nBuild error in component \`${value}\` is a reserved keyword for type`,
      ),
    );
  }

  return value;
};

const schema: ObjectSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string(), // DEPRECATED
  category: Joi.string(), // DEPRECATED
  $afterCreate: Joi.object({
    query: Joi.string().required(),
    input: Joi.object().pattern(Joi.string(), Joi.any()).required(),
    output: Joi.object().pattern(
      Joi.string(),
      Joi.object({
        ref: Joi.string(),
      }),
    ),
  }),
  type: Joi.string().required().custom(reservedTypes),
  allowedTypes: Joi.array().items(Joi.string()).required(),
  orientation: Joi.string().required(),
  dependencies: Joi.object().pattern(
    /.*/,
    Joi.object({
      package: Joi.string()
        .pattern(/^[a-z]+:[^~)('!*@]+(@[0-9\.\-a-z]+)$/)
        .required(),
      imports: Joi.array().items(Joi.string()).required(),
    }),
  ),
  functions: Joi.array().items(Joi.string()),
  triggers: Joi.array().items(Joi.string()),
  interactions: Joi.object(),
  jsx: Joi.any().required(),
  styles: Joi.any().required(),
  styleType: Joi.string().valid(...STYLE_REFERENCE_TYPES),
  transpiledJsx: Joi.string(),
  transpiledStyles: Joi.string(),
});

const validate = (component: Component): void => {
  const { error }: ValidationResult = schema.validate(component);

  if (typeof error !== 'undefined') {
    throw new Error(
      chalk.red(
        `\nProperty: ${error.message} at component: ${component.name}\n`,
      ),
    );
  }
};

export default (components: Component[]): void => {
  components.forEach((component: Component): void => {
    validate(component);
  });

  findDuplicates(components, 'component', 'name');
};
