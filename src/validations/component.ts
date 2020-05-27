import Joi, { ObjectSchema, ValidationResult } from '@hapi/joi';
import chalk from 'chalk';

import { Component } from '../types';
import { findDuplicates } from '../utils/validation';

const schema: ObjectSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string(), // DEPRECATED
  category: Joi.string(), // DEPRECATED
  type: Joi.string().required(),
  allowedTypes: Joi.array()
    .items(Joi.string())
    .required(),
  orientation: Joi.string().required(),
  functions: Joi.array().items(Joi.string()),
  triggers: Joi.array().items(Joi.string()),
  jsx: Joi.any().required(),
  styles: Joi.any().required(),
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

  findDuplicates(components, 'component');
};
