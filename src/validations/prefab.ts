/* eslint-disable no-use-before-define */
// Array spread is done because of this issue: https://github.com/hapijs/joi/issues/1449#issuecomment-532576296

import chalk from 'chalk';
import Joi from 'joi';

import { Prefab, PrefabAction } from '../types';
import { findDuplicates } from '../utils/validation';
import { ICONS } from './constants';
import { actionSchema } from './prefab/action';
import { validateComponent } from './prefab/component';
import { interactionSchema } from './prefab/interaction';
import { variableSchema } from './prefab/variable';

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
  const { actions, interactions, variables } = prefab;
  const { error } = schema.validate(prefab);

  if (Array.isArray(actions)) {
    findDuplicates(actions as PrefabAction[], 'action', { ref: 'id' });
  }

  if (Array.isArray(interactions)) {
    findDuplicates(interactions, 'interaction', 'name');
  }

  if (Array.isArray(variables)) {
    findDuplicates(variables, 'variable', 'name');
    findDuplicates(variables, 'action', { ref: 'id' });
  }

  if (typeof error !== 'undefined') {
    throw new Error(
      chalk.red(`\nProperty: ${error.message} at prefab: ${prefab.name}\n`),
    );
  }
};

export default (prefabs: Prefab[]): void => {
  prefabs.forEach(validate);

  findDuplicates(prefabs, 'prefab', 'name');
};
