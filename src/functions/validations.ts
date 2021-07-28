import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { Validator, ValidatorResult, ValidationError } from 'jsonschema';

export type FunctionDefinition = {
  name: string;
  [other: string]: unknown;
};

export type FunctionDefinitions = {
  [key: string]: FunctionDefinition;
};

export type Schema = {
  $id: string;
};

export type Config = {
  schemaUrl: string;
  functionSchemaPath: string;
};

const functionJsonPath = (functionPath: string): string =>
  path.join(functionPath, 'function.json');

const isFunction = (functionPath: string): boolean =>
  fs.pathExistsSync(functionJsonPath(functionPath));

const fetchFunction = (functionPath: string): object => {
  const filePath = functionJsonPath(functionPath);
  try {
    return fs.readJSONSync(filePath);
  } catch (err) {
    throw new Error(`could not load json from ${filePath}: ${err}`);
  }
};

const functionDefinitions = (functionsDir: string): FunctionDefinitions => {
  const functionDirs = fs.readdirSync(functionsDir);

  return functionDirs.reduce(
    (definitions, functionDir) => {
      if (isFunction(functionDir)) {
        const functionJson = fetchFunction(
          functionJsonPath(functionDir),
        ) as FunctionDefinition;

        return {
          [functionDir]: functionJson,
          ...definitions,
        };
      }

      return definitions;
    },
    {} as { [key: string]: FunctionDefinition },
  );
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

export {
  isFunction,
  fetchFunction,
  functionJsonPath,
  functionDefinitions,
  functionValidator,
  validateFunction,
};
