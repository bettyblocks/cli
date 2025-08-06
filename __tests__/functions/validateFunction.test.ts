import { test, expect } from 'bun:test';
import path from 'path';
import { Validator } from 'jsonschema';
import { functionDefinition } from '../../src/functions/functionDefinitions';
import { validateSchema } from '../../src/functions/validations';

const schema = {
  $id: '/schema/actions/function.json',
  title: 'Function',
  properties: {
    label: {
      type: 'string',
    },
    icon: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
        },
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
      },
      required: ['name', 'color'],
    },
  },
  required: ['label'],
};

const validator = new Validator();
validator.addSchema(schema, schema.$id);

test('load in entire schema for validator', async (): Promise<void> => {
  const definition = {
    path: '/path/to/schema/actions/function.json',
    schema: {
      label: 'Create',
      icon: {
        name: 'ChatIcon',
        color: 'Teal',
      },
    },
  };

  const { status, errors } = await validateSchema(definition, validator);

  expect(status).toBe('ok');
  expect(errors.length).toBe(0);
});

test('validate templates', async (): Promise<void> => {
  const functionPath = path.join(
    process.cwd(),
    'assets/app-functions/templates',
    'functions/say-hello/1.0',
  );

  const functionJson = functionDefinition(
    functionPath,
    path.join(process.cwd(), 'functions'),
  );

  const { status } = await validateSchema(functionJson, validator);

  expect(status).toBe('ok');
});

test('invalidate empty schemas', async (): Promise<void> => {
  const {
    status,
    errors: [{ message }],
  } = await validateSchema(
    {
      path: '/path/to/schema/actions/function.json',
      schema: {},
    },
    validator,
  );

  expect(status).toBe('error');
  expect(message).toBe('requires property "label"');
});

test('invalidate schemas that do not have valid values for properties', async (): Promise<void> => {
  const definition = {
    path: '/path/to/schema/actions/function.json',
    schema: {
      label: 'Create',
      icon: 'RandomIcon',
    },
  };

  const {
    status,
    errors: [{ message }],
  } = await validateSchema(definition, validator);

  expect(status).toBe('error');
  expect(message, 'is not of a type(s) object');
});
