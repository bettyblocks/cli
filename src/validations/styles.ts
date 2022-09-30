import chalk from 'chalk';
import Joi from 'joi';
import { StyleDefinition } from '../types';

const RefOrValue = Joi.object({
  type: Joi.string().valid('THEME_COLOR', 'STATIC'),
  value: Joi.string().required(),
});

const ArrayValue = Joi.array().items(Joi.string()).min(1).max(4);

const cssObjectSchema = Joi.object({
  backgroundColor: RefOrValue,
  borderColor: RefOrValue,
  borderRadius: ArrayValue,
  borderStyle: Joi.string(),
  borderWidth: ArrayValue,
  boxShadow: Joi.string(),
  color: RefOrValue,
  fontFamily: Joi.string(),
  fontSize: Joi.string(),
  fontStyle: Joi.string(),
  fontWeight: Joi.string(),
  letterSpacing: Joi.string(),
  lineHeight: Joi.string(),
  padding: ArrayValue,
  textDecoration: Joi.string(),
  textTransform: Joi.string(),
});

const classSchema = Joi.object({
  className: Joi.string().required(),
  styleObject: cssObjectSchema.required().min(1),
});

const styleTypeSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  content: Joi.array().items(classSchema).unique('name').required().min(1),
});

const validateUnique = (a: StyleDefinition, b: StyleDefinition) =>
  a.name === b.name && a.type === b.type;

const validateAll = (styleTypes: StyleDefinition[]) => {
  const { error } = Joi.array()
    .items(styleTypeSchema)
    .unique(validateUnique)
    .validate(styleTypes);

  if (error) {
    throw new Error(chalk.red(`\nStyleTypes: ${error.message}\n`));
  }
};

export default (styleTypes: StyleDefinition[]): void => {
  validateAll(styleTypes);
};
