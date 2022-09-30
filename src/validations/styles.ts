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

const schemaProvider = (): Joi.ObjectSchema => {
  return Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    content: Joi.array().items(classSchema).unique('name').required().min(1),
  });
};

const validate = (styleType: StyleDefinition): void => {
  const { error } = schemaProvider().validate(styleType);

  if (error) {
    throw new Error(
      chalk.red(`\nStyleType: ${error.message} at: ${styleType.name}\n`),
    );
  }
};

const findDuplicates = (styleTypes: StyleDefinition[]): void => {
  styleTypes.reduce((acc: Set<string>, item: StyleDefinition) => {
    const valueLower = `${item.type}_${item.name}`.toLowerCase();

    if (acc.has(valueLower)) {
      throw new Error(
        chalk.red(
          `\nThe Style "${item.name}" for type: "${item.type}" is already defined \n`,
        ),
      );
    }

    return acc.add(valueLower);
  }, new Set());
};

export default (styleTypes: StyleDefinition[]): void => {
  styleTypes.forEach((styleType) => validate(styleType));

  findDuplicates(styleTypes);
};
