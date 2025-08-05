/* eslint-disable no-use-before-define */
// Array spread is done because of this issue: https://github.com/hapijs/joi/issues/1449#issuecomment-532576296

import chalk from 'chalk';
import Joi from 'joi';
import type { ComponentStyleMap, GroupedStyles, Prefab } from '../types';
import { findDuplicates } from '../utils/validation';
import {
  ICONS,
  MAX_ACTIONS,
  MAX_INTERACTIONS,
  MAX_VARIABLES,
} from './constants';
import { actionSchema } from './prefab/action';
import { validateComponent } from './prefab/component';
import { interactionSchema } from './prefab/interaction';
import { variableSchema } from './prefab/variable';

export type PrefabTypes = 'partial' | 'page' | undefined;
const schemaProvider = (
  styles: GroupedStyles,
  componentStyleMap?: ComponentStyleMap,
  availableComponentNames?: string[],
  prefabType?: PrefabTypes,
): Joi.ObjectSchema => {
  return Joi.object({
    name: Joi.string().required(),
    keywords: Joi.array(),
    icon: Joi.string()
      .valid(...ICONS)
      .required(),
    category: Joi.string().required(),
    type:
      prefabType === 'partial' ? Joi.forbidden() : Joi.string().valid('page'),
    description: Joi.string(),
    isPublicPage: Joi.boolean(),
    developerMode: Joi.string().valid('basic', 'advanced'),
    detail: Joi.string(),
    previewImage: Joi.string(),
    previewUrl: Joi.string(),
    interactions: Joi.array().items(interactionSchema).max(MAX_INTERACTIONS),
    actions: Joi.array().items(actionSchema).max(MAX_ACTIONS),
    variables: Joi.array().items(variableSchema).max(MAX_VARIABLES),
    beforeCreate: Joi.any(),
    structure: Joi.array()
      .items(
        Joi.custom(
          validateComponent(
            styles,
            componentStyleMap,
            availableComponentNames,
            prefabType,
          ),
        ),
      )
      .required(),
    reconfigure: Joi.any(),
  });
};

const validate =
  (
    styles: GroupedStyles,
    componentStyleMap?: ComponentStyleMap,
    availableComponentNames?: string[],
    prefabType?: PrefabTypes,
  ) =>
  (prefab: Prefab): void => {
    const { actions, variables } = prefab;
    const { error } = schemaProvider(
      styles,
      componentStyleMap,
      availableComponentNames,
      prefabType,
    ).validate(prefab);

    if (Array.isArray(actions)) {
      findDuplicates(actions, 'action', { ref: 'id' });
    }

    if (Array.isArray(variables)) {
      findDuplicates(variables, 'variable', 'name');
      findDuplicates(variables, 'action', { ref: 'id' });
    }

    if (error) {
      throw new Error(
        chalk.red(`\nProperty: ${error.message} at prefab: ${prefab.name}\n`),
      );
    }
  };

export default (
  prefabs: Prefab[],
  styles: GroupedStyles,
  componentStyleMap?: ComponentStyleMap,
  availableComponentNames?: string[],
  prefabType?: PrefabTypes,
): void => {
  prefabs.forEach(
    validate(styles, componentStyleMap, availableComponentNames, prefabType),
  );

  findDuplicates(prefabs, 'prefab', 'name');
};
