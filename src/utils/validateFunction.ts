import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import fetch from 'node-fetch';
import { Validator, ValidatorResult } from 'jsonschema';

export type FunctionDefinition = {
  id?: string;
  name?: string;
};

export type FunctionSchema = {
  $id: string;
};

const baseSchemaUrl =
  'https://raw.githubusercontent.com/bettyblocks/json-schema/feature/add-first-draft-for-action-functions';
const functionSchemaPath = '/schemas/actions/function.json';

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

const fetchSchema = async (
  baseUrl: string,
  functionPath: string,
): Promise<FunctionSchema> => {
  const fullUrl = baseSchemaUrl + functionPath;
  return fetch(fullUrl).then(res => (res.json() as unknown) as FunctionSchema);
};

const importNextSchema = async (validator: Validator): Promise<Validator> => {
  const nextSchema = validator.unresolvedRefs.shift();
  if (!nextSchema) {
    return validator;
  }

  const schema = await fetchSchema(baseSchemaUrl, nextSchema);
  validator.addSchema(schema);
  return importNextSchema(validator);
};

const functionValidator = async (
  schemaUrl: string,
): Promise<{ validator: Validator; functionSchema: FunctionSchema }> => {
  const url = schemaUrl || baseSchemaUrl;
  console.log(`Fetching functions schema from ${url}`);
  const validator = new Validator();
  const functionSchema = await fetchSchema(url, functionSchemaPath);

  validator.addSchema(functionSchema);
  await importNextSchema(validator);

  return { validator, functionSchema };
};

const validateFunctionDefinition = async (
  validator: Validator,
  functionSchema: FunctionSchema,
  functionDefinition: FunctionDefinition,
): Promise<ValidatorResult> => {
  return validator.validate(functionDefinition, functionSchema);
};

const validateFunction = async (
  functionPath: string,
  validator: Validator,
  functionSchema: FunctionSchema,
): Promise<void> => {
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
