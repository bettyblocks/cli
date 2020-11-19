import chalk from 'chalk';
import Joi, { ObjectSchema, ValidationResult } from 'joi';

import { Interaction } from '../types';
import { findDuplicates } from '../utils/validation';

const schema: ObjectSchema = Joi.object({
  name: Joi.string().required(),
  function: Joi.string().required(),
  parameters: Joi.object().required(),
  type: Joi.string().required(),
});

const validate = (interaction: Interaction): void => {
  const { error }: ValidationResult = schema.validate(interaction);

  if (typeof error !== 'undefined') {
    throw new Error(
      chalk.red(
        `\nProperty: ${error.message} at interaction: ${interaction.name}\n`,
      ),
    );
  }
};

export default (interactions: Interaction[]): void => {
  interactions.forEach((interaction: Interaction): void => {
    validate(interaction);
  });

  findDuplicates(interactions, 'interaction');
};
