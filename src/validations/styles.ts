import chalk from 'chalk';
import Joi from 'joi';
import { join } from 'lodash';
import { StyleDefinition, AllowedStateKeys } from '../types';

const shadows = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
  '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
  '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
  '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
  '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
  '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
  '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
  '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
  '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
  '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
  '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
  '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
];

const isString = Joi.string().max(255);
const validRem = /^\d{1,5}\.?\d{0,5}rem$/;
const optionType = ['STATIC', 'THEME_COLOR'];

export const cssObjectSchema = Joi.object({
  backgroundColor: Joi.object({
    type: optionType,
    value: isString,
  }),
  borderColor: Joi.object({
    type: optionType,
    value: isString,
  }),
  borderRadius: Joi.array().max(1).items(isString.required().pattern(validRem)),
  borderStyle: isString,
  borderWidth: Joi.array().max(1).items(isString.required().pattern(validRem)),

  boxShadow: shadows,
  color: Joi.object({
    type: optionType,
    value: isString,
  }),
  fontFamily: ['Roboto', 'serif', 'sans-serif', 'monospace'],
  fontSize: isString.pattern(validRem),
  fontStyle: ['italic', 'normal', 'none'],
  fontWeight: ['300', '400', '500', '700'],
  letterSpacing: Joi.alternatives().try(
    isString.pattern(validRem),
    isString.allow('normal'),
  ),
  lineHeight: Joi.string().max(255).pattern(/^\d*$/),
  padding: [
    isString,
    Joi.array().max(4).items(isString.required().pattern(validRem)),
  ],
  textDecoration: ['underline', 'none'],
  textTransform: ['uppercase', 'none'],
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
    if (componentNames.includes(type)) {
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
