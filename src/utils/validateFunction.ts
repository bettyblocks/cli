import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import fetch from 'node-fetch';
import { Validator, ValidatorResult } from 'jsonschema';

export type FunctionDefinition = {
  id?: string;
  name?: string;
};

export type Schema = {
  $id: string;
};

export type Config = {
  schemaUrl: string;
  functionSchemaPath: string;
};

const config = fs.readJSONSync(
  path.join(process.cwd(), 'config.json'),
) as Config;
const { schemaUrl: baseSchemaUrl, functionSchemaPath } = config;

const functionExists = async (
  functionPath: string,
): Promise<FunctionDefinition> => {
  let json: FunctionDefinition;
  const filePath = path.join(functionPath, 'function.json');
  try {
    const exists = await fs.pathExists(filePath);
    if (!exists) throw new Error(`file not found ${filePath}`);
    json = await fs.readJSON(filePath);
  } catch (err) {
    throw new Error(`could not load json from ${functionPath}: ${err}`);
  }
  return json;
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
  functionSchema: Schema,
  functionDefinition: FunctionDefinition,
): Promise<ValidatorResult> => {
  return validator.validate(functionDefinition, functionSchema);
};

const validateFunction = async (
  functionPath: string,
  validator: Validator,
): Promise<void> => {
  const functionSchemaId = Object.keys(validator.schemas).find(k => {
    return k.match(/function\.json$/);
  });
  if (!functionSchemaId) {
    throw new Error(`Cannot find Function schema Id, ${functionSchemaId}`);
  }
  const functionSchema = validator.schemas[functionSchemaId] as Schema;

  functionExists(functionPath)
    .then(json => {
      const functionName = json.name || functionPath;

      validateFunctionDefinition(validator, functionSchema, json).then(
        ({ errors }) => {
          if (errors.length) {
            const msg = chalk.red(`${errors}`);
            const status = chalk.red(`x`);
            console.log(`${status} Validated: ${functionName}\n\t${msg}`);
          } else {
            const status = chalk.green(`√`);
            console.log(`${status} Validated: ${functionName}`);
          }
        },
      );
    })
    .catch(({ message }) => {
      const status = chalk.red(`x`);
      const msg = chalk.red(message);
      console.log(`${status} Validated: ${functionPath}\n\t${msg}`);
    });
};

export { functionValidator, validateFunction };
