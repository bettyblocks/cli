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

const baseSchemaUrl =
  'https://github.com/bettyblocks/json-schema/raw/feature/add-first-draft-for-action-functions';
const functionSchemaId = '/schemas/actions/function.json';

const functionExists = async (
  functionPath: string,
): Promise<FunctionDefinition> => {
  let json: FunctionDefinition;
  const filePath = path.join(functionPath, 'function.json');
  try {
    const exists = await fs.pathExists(filePath);
    if (!exists) throw new Error(`file not found ${filePath}`);
    json = await fs.readJson(filePath);
  } catch (err) {
    throw new Error(`could not load json from ${functionPath}: ${err}`);
  }
  return json;
};

const fetchRemoteSchema = async (
  functionPath: string,
  options: {
    schemaUrl: string;
  },
): Promise<Schema> => {
  const fullUrl = options.schemaUrl + functionPath;
  console.log('Fetching:', fullUrl);
  return fetch(fullUrl)
    .then(res => {
      return (res.json() as unknown) as Schema;
    })
    .catch(err => {
      console.log(err);
      return { $id: 'unknown' } as Schema;
    });
};

const importSchema = async (
  validator: Validator,
  schemaUrl: string,
): Promise<Validator> => {
  return importNextSchema(validator, functionSchemaId, { schemaUrl });
};

const importNextSchema = async (
  validator: Validator,
  schema: string,
  options: { schemaUrl: string },
): Promise<Validator> => {
  const schemaJSON = await fetchRemoteSchema(schema, options);
  validator.addSchema(schemaJSON);

  const nextSchema = validator.unresolvedRefs.shift();
  if (!nextSchema) {
    return validator;
  } else {
    return importNextSchema(validator, nextSchema, options);
  }
};

const functionValidator = async (schemaUrl: string): Promise<Validator> => {
  const url = schemaUrl || baseSchemaUrl;
  console.log(`Fetching functions schema from ${url}`);
  const validator = new Validator();

  return importSchema(validator, url);
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
