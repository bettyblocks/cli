/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/restrict-template-expressions */
import fetch from 'node-fetch';
import path from 'path';
import chalk from 'chalk';
import { Validator, ValidatorResult, ValidationError } from 'jsonschema';

import {
  FunctionDefinition,
  functionDefinition,
  functionDefinitions,
} from './functionDefinitions';
import Config from './config';

export type Schema = {
  $id: string;
};

export type ValidationResult = {
  path: string;
  status: string;
  functionName?: string;
  errors: ValidationError[] | { message: string }[];
};

const fetchRemoteSchema = async (schemaUrl: string): Promise<Schema> => {
  const res = await fetch(schemaUrl);
  const json = await res.json();
  return json as Schema;
};

const importNextSchema = async (
  validator: Validator,
  schemaId: string,
): Promise<Validator> => {
  const schemaJSON = await fetchRemoteSchema(schemaId);
  validator.addSchema(schemaJSON, schemaId);

  const nextSchemaId = validator.unresolvedRefs.shift();
  if (!nextSchemaId) {
    return validator;
  }
  return importNextSchema(validator, nextSchemaId);
};

const importSchema = async (
  validator: Validator,
  config: Config,
): Promise<Validator> => {
  const functionSchemaUrl = config.schemaUrl + config.functionSchemaPath;
  return importNextSchema(validator, functionSchemaUrl);
};

const functionValidator = async (config: Config): Promise<Validator> => {
  const validator = new Validator();

  return importSchema(validator, config);
};

const validateFunctionDefinition = (
  validator: Validator,
  definition: object,
): ValidatorResult => {
  const functionSchemaId = Object.keys(validator.schemas).find((k) => {
    return k.match(/function\.json$/);
  });

  if (!functionSchemaId) {
    throw new Error(`Cannot find Function schema Id, ${functionSchemaId}`);
  }

  const functionSchema = validator.schemas[functionSchemaId] as Schema;
  return validator.validate(definition, functionSchema);
};

const validateFunction = (
  functionJson: object,
  validator: Validator,
): ValidationResult => {
  const { path: definitionPath, schema } = functionJson as FunctionDefinition;
  const { errors } = validateFunctionDefinition(validator, schema);

  const status = errors.length ? 'error' : 'ok';

  return {
    status,
    path: definitionPath,
    functionName: schema.name,
    errors,
  };
};

class FunctionValidator {
  private schemaValidator: Validator;

  private config: Config;

  private functionsDir: string;

  constructor(config: Config, functionsDir: string) {
    this.config = config;
    this.schemaValidator = new Validator();
    this.functionsDir = functionsDir;
  }

  async initSchema(): Promise<void> {
    await importSchema(this.schemaValidator, this.config);
  }

  validateFunction(functionName: string): ValidationResult {
    const functionPath = path.join(this.functionsDir, functionName);
    try {
      const definition = functionDefinition(functionPath);
      return validateFunction(definition, this.schemaValidator);
    } catch (err) {
      return {
        status: 'error',
        path: functionPath,
        functionName,
        errors: [{ message: `${err}` }],
      };
    }
  }

  async validateFunctions(): Promise<ValidationResult[]> {
    const definitions = functionDefinitions(this.functionsDir);

    const validations = definitions.map((definition) => {
      return validateFunction(definition, this.schemaValidator);
    });

    return Promise.all(validations);
  }
}

const logValidationResult = ({
  path: functionPath,
  status,
  functionName,
  errors,
}: ValidationResult): void => {
  if (status === 'ok') {
    const mark = chalk.green(`✔`);
    console.log(`${mark} Validate: ${functionName}`);
  } else {
    const msg = chalk.red(`${errors}`);
    const mark = chalk.red(`✖`);
    console.log(`${mark} Validate: ${functionName || functionPath}\n\t${msg}`);
  }
};

export {
  FunctionValidator,
  functionValidator,
  validateFunction,
  logValidationResult,
};
