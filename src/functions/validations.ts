import chalk from 'chalk';
import { ValidationError, Validator, ValidatorResult } from 'jsonschema';
import fetch from 'node-fetch';
import path from 'path';

import Config from './config';
import {
  type FunctionDefinition,
  functionDefinitions,
  isFunctionVersion,
} from './functionDefinitions';

export interface Schema {
  $id: string;
}

export interface ValidationResult {
  path: string;
  status: string;
  functionName?: string;
  errors: ValidationError[] | Error[];
}

const fetchRemoteSchema = async (
  schemaUrl: string,
  config: Config,
): Promise<Schema> => {
  const res = await fetch(schemaUrl, { agent: config.agent });
  const json = await res.json();
  return json as Schema;
};

const importNextSchema = async (
  validator: Validator,
  schemaId: string,
  config: Config,
): Promise<Validator> => {
  const schemaJSON = await fetchRemoteSchema(schemaId, config);
  validator.addSchema(schemaJSON, schemaId);

  const nextSchemaId = validator.unresolvedRefs.shift();
  if (!nextSchemaId) {
    return validator;
  }
  return importNextSchema(validator, nextSchemaId, config);
};

const importSchema = async (
  validator: Validator,
  config: Config,
): Promise<Validator> => {
  const functionSchemaUrl = config.schemaUrl + config.functionSchemaPath;
  return importNextSchema(validator, functionSchemaUrl, config);
};

const functionValidator = async (config: Config): Promise<Validator> => {
  const validator = new Validator();

  return importSchema(validator, config);
};

const validateFunctionDefinition = (
  validator: Validator,
  definition: object,
): ValidatorResult => {
  const functionSchemaId = Object.keys(validator.schemas).find((k) =>
    k.match(/function\.json$/),
  );

  if (!functionSchemaId) {
    throw new Error(`Cannot find Function schema Id, ${functionSchemaId}`);
  }

  const functionSchema = validator.schemas[functionSchemaId] as Schema;
  return validator.validate(definition, functionSchema);
};

const forceVersion = (
  { path: functionPath }: FunctionDefinition,
  functionsDir: string,
): void => {
  if (!isFunctionVersion(path.dirname(functionPath), functionsDir)) {
    throw new Error(
      `${path.dirname(
        functionPath,
      )} does not apply as a valid version directory`,
    );
  }
};

const validateSchema = (
  functionJson: FunctionDefinition,
  validator: Validator,
): ValidationResult => {
  const { name, version, path: definitionPath, schema } = functionJson;

  const { errors } = validateFunctionDefinition(validator, schema);
  const status = errors.length ? 'error' : 'ok';

  return {
    errors,
    functionName: `${name}-${version}`,
    path: definitionPath,
    status,
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

  validateFunction(definition: FunctionDefinition): ValidationResult {
    const functionPath = definition.path;
    const functionName = functionPath;

    try {
      forceVersion(definition, this.functionsDir);
      return validateSchema(definition, this.schemaValidator);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        errors: [new Error(message)],
        functionName,
        path: functionPath,
        status: 'error',
      };
    }
  }

  async validateFunctions(
    functionName?: string,
    blockFunctions?: FunctionDefinition[],
  ): Promise<ValidationResult[]> {
    const definitions = functionDefinitions(this.functionsDir, true);
    const functions = blockFunctions ?? definitions;
    const validations: ValidationResult[] = [];
    functions.forEach((definition) => {
      const preleadingPath = path.join(
        this.functionsDir,
        functionName ?? '',
        path.sep,
      );
      if (definition.path.indexOf(preleadingPath) === 0) {
        validations.push(this.validateFunction(definition));
      }
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
    console.log(`${mark} Validate: ${functionName ?? functionPath}\n\t${msg}`);
  }
};

export {
  FunctionValidator,
  functionValidator,
  logValidationResult,
  validateSchema,
};
