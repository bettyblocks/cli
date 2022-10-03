import chalk from 'chalk';
import Joi from 'joi';
import { StyleDefinition, AllowedStateKeys } from '../types';

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

const stateSchema = Joi.object({
  name: Joi.string()
    .required()
    .allow(...Object.keys(AllowedStateKeys)),
  cssObject: cssObjectSchema.required().min(1),
});

const validateStyleType =
  (componentNames: string[]) =>
  (type: string): string | undefined => {
    if (type in componentNames) {
      return type;
    }
    throw new Error(
      chalk.red(
        `\n type for style invalid: ${type} is not available as a component \n`,
      ),
    );
  };

const styleSchema = (componentNames: string[]) =>
  Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required().custom(validateStyleType(componentNames)),
    basis: cssObjectSchema.required().min(1),
    states: Joi.array().items(stateSchema).unique('name').required(),
  });

const validateUnique = (a: StyleDefinition, b: StyleDefinition) =>
  a.name === b.name && a.type === b.type;

const validateAll = (styles: StyleDefinition[], componentNames: string[]) => {
  const { error } = Joi.array()
    .items(styleSchema(componentNames))
    .unique(validateUnique)
    .validate(styles);

  if (error) {
    throw new Error(chalk.red(`\nStyles: ${error.message}\n`));
  }
};

export default (styles: StyleDefinition[], componentNames: string[]): void => {
  validateAll(styles, componentNames);
};
