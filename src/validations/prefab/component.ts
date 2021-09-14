/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */

import chalk from 'chalk';
import Joi from 'joi';

import { Prefab, PrefabComponent } from '../../types';
import { findDuplicates } from '../../utils/validation';
import { optionSchema } from './componentOption';

const componentSchema = Joi.object({
  name: Joi.string().required(),
  style: Joi.object({
    name: Joi.string()
      .max(255)
      .alphanum(),
  }),
  ref: Joi.object({
    id: Joi.string().required(),
  }),
  options: Joi.array()
    .items(optionSchema)
    .required(),
  descendants: Joi.array()
    .items(Joi.custom(validateComponent))
    .required(),
});

export function validateComponent(
  component: PrefabComponent,
): Prefab | unknown {
  const { name, options } = component;
  const { error } = componentSchema.validate(component);

  findDuplicates(options, 'option key', 'key');

  if (typeof error !== 'undefined') {
    const { message } = error;

    throw new Error(
      chalk.red(`\nBuild error in component ${name}: ${message}\n`),
    );
  }

  return component;
}
