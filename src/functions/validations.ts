import fetch from 'node-fetch';
import { Validator, ValidatorResult, ValidationError } from 'jsonschema';

import { FunctionDefinition } from './functionDefinitions';
import Config from './config';

export type Schema = {
  $id: string;
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
  functionDefinition: object,
): ValidatorResult => {
  const functionSchemaId = Object.keys(validator.schemas).find(k => {
    return k.match(/function\.json$/);
  });

  if (!functionSchemaId) {
    throw new Error(`Cannot find Function schema Id, ${functionSchemaId}`);
  }

  const functionSchema = validator.schemas[functionSchemaId] as Schema;
  return validator.validate(functionDefinition, functionSchema);
};

const validateFunction = async (
  functionJson: object,
  validator: Validator,
): Promise<{
  status: string;
  functionName?: string;
  errors: ValidationError[];
}> => {
  const { errors } = validateFunctionDefinition(validator, functionJson);
  const func = functionJson as FunctionDefinition;

  if (errors.length) {
    return {
      status: 'error',
      functionName: func.name,
      errors,
    };
  }
  return {
    status: 'ok',
    functionName: func.name,
    errors,
  };
};

export { functionValidator, validateFunction };
