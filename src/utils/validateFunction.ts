import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { Validator, ValidatorResult, ValidationError } from 'jsonschema';

type FunctionDefinition = {
  id?: string;
  name?: string;
};

export type Schema = {
  $id: string;
};

type Config = {
  schemaUrl: string;
  functionSchemaPath: string;
};

const config = fs.readJSONSync(
  path.join(process.cwd(), 'config.json'),
) as Config;
const { schemaUrl: baseSchemaUrl, functionSchemaPath } = config;

const fetchFunction = async (
  functionPath: string,
): Promise<FunctionDefinition> => {
  const filePath = path.join(functionPath, 'function.json');
  try {
    const exists = await fs.pathExists(filePath);
    if (!exists) throw new Error(`file not found ${filePath}`);
    return (await fs.readJSON(filePath)) as FunctionDefinition;
  } catch (err) {
    throw new Error(`could not load json from ${functionPath}: ${err}`);
  }
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

const importSchema = async (validator: Validator): Promise<Validator> => {
  const functionSchemaUrl = baseSchemaUrl + functionSchemaPath;
  return importNextSchema(validator, functionSchemaUrl);
};

const functionValidator = async (): Promise<Validator> => {
  const validator = new Validator();

  return importSchema(validator);
};

const validateFunctionDefinition = async (
  validator: Validator,
  functionDefinition: FunctionDefinition,
): Promise<ValidatorResult> => {
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
  functionJson: FunctionDefinition,
  validator: Validator,
): Promise<{
  status: string;
  functionName?: string;
  errors?: ValidationError[];
}> => {
  return validateFunctionDefinition(validator, functionJson).then(
    ({ errors }) => {
      if (errors.length) {
        return { status: 'error', functionName: functionJson.name, errors };
      }
      return { status: 'ok', functionName: functionJson.name };
    },
  );
};

export { fetchFunction, functionValidator, validateFunction };
