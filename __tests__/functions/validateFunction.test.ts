import { expect, test } from 'bun:test';
import { Validator } from 'jsonschema';
import path from 'path';

import {
  type FunctionDefinition,
  functionDefinition,
} from '../../src/functions/functionDefinitions';
import { validateSchema } from '../../src/functions/validations';

const schema = {
  $id: '/schema/actions/function.json',
  properties: {
    icon: {
      additionalProperties: false,
      properties: {
        color: {
          enum: [
            'Yellow',
            'Green',
            'Pink',
            'Orange',
            'Purple',
            'Blue',
            'Teal',
            'Grey',
          ],
        },
        name: {
          type: 'string',
        },
      },
      required: ['name', 'color'],
      type: 'object',
    },
    label: {
      type: 'string',
    },
  },
  required: ['label'],
  title: 'Function',
};

const validator = new Validator();
validator.addSchema(schema, schema.$id);

test('load in entire schema for validator', async (): Promise<void> => {
  const definition = {
    name: 'Create',
    path: '/path/to/schema/actions/function.json',
    schema: {
      icon: {
        color: 'Teal',
        name: 'ChatIcon',
      },
      label: 'Create',
    },
    version: '1.0',
  } satisfies FunctionDefinition;

  const { status, errors } = validateSchema(definition, validator);

  expect(status).toBe('ok');
  expect(errors.length).toBe(0);
});

test('validate js-templates', async (): Promise<void> => {
  const functionPath = path.join(
    process.cwd(),
    'assets/app-functions/js-template',
    'functions/say-hello/1.0',
  );

  const functionJson = functionDefinition(
    functionPath,
    path.join(process.cwd(), 'functions'),
  );

  const { status } = validateSchema(functionJson, validator);

  expect(status).toBe('ok');
});

test('invalidate empty schemas', async (): Promise<void> => {
  const definition = {
    path: '/path/to/schema/actions/function.json',
    schema: {},
  } as FunctionDefinition;
  const {
    status,
    errors: [{ message }],
  } = validateSchema(definition, validator);

  expect(status).toBe('error');
  expect(message).toBe('requires property "label"');
});

test('invalidate schemas that do not have valid values for properties', async (): Promise<void> => {
  const definition = {
    path: '/path/to/schema/actions/function.json',
    schema: {
      icon: 'RandomIcon',
      label: 'Create',
    },
  } as unknown as FunctionDefinition;

  const {
    status,
    errors: [{ message }],
  } = validateSchema(definition, validator);

  expect(status).toBe('error');
  expect(message, 'is not of a type(s) object');
});
