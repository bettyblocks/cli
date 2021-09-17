/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */

import chalk from 'chalk';
import Joi from 'joi';

import {
  Prefab,
  PrefabComponent,
  ComponentStyleMap,
  Component,
} from '../../types';
import { findDuplicates } from '../../utils/validation';
import { optionSchema } from './componentOption';

type StyleValidator = Record<Component['styleType'], Joi.ObjectSchema>;

const isString = Joi.string().max(255);
const isArray = Joi.array()
  .max(4)
  .items(isString.required());

const styleValidator: StyleValidator = {
  BUTTON: Joi.object({
    backgroundColor: isString,
    borderColor: isString,
    borderRadius: [isString, isArray],
    borderStyle: isString,
    borderWidth: [isString, isArray],
    boxShadow: isString,
    color: isString,
    fontFamily: isString,
    fontSize: isString,
    fontStyle: isString,
    fontWeight: isString,
    letterSpacing: isString,
    lineHeight: isString,
    padding: [isString, isArray],
    textDecoration: isString,
    textTransform: isString,
  }),
};

const componentSchema = (
  componentStyleMap?: ComponentStyleMap,
  styleType?: keyof StyleValidator,
): Joi.ObjectSchema => {
  const canValidateStyle =
    styleType && styleValidator[styleType as keyof StyleValidator];

  return Joi.object({
    name: Joi.string().required(),
    style: Joi.object({
      name: Joi.string()
        .max(255)
        .alphanum(),
      overwrites: canValidateStyle || Joi.any(),
    }),
    ref: Joi.object({
      id: Joi.string().required(),
    }),
    options: Joi.array()
      .items(optionSchema)
      .required(),
    descendants: Joi.array()
      .items(Joi.custom(validateComponent(componentStyleMap)))
      .required(),
  });
};

export const validateComponent = (componentStyleMap?: ComponentStyleMap) => (
  component: PrefabComponent,
): Prefab | unknown => {
  const { name, options } = component;

  const styleType: Component['styleType'] | undefined =
    componentStyleMap &&
    componentStyleMap[name] &&
    componentStyleMap[name].styleType;
  const { error } = componentSchema(
    componentStyleMap,
    styleType as keyof StyleValidator,
  ).validate(component);

  findDuplicates(options, 'option key', 'key');

  if (typeof error !== 'undefined') {
    const { message } = error;

    throw new Error(
      chalk.red(`\nBuild error in component ${name}: ${message}\n`),
    );
  }

  return component;
};
