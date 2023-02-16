import test, { ExecutionContext } from 'ava';
import path from 'path';
import { Validator } from 'jsonschema';
import { functionDefinition } from '../../src/functions/functionDefinitions';
import { validateSchema } from '../../src/functions/validations';

type Context = ExecutionContext<unknown>;

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

test('load in entire schema for validator', async (t: Context): Promise<void> => {
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

  t.is(status, 'ok');
  t.is(errors.length, 0);
});

test('validate templates', async (t: Context): Promise<void> => {
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

  t.is(status, 'ok');
});

test('invalidate empty schemas', async (t: Context): Promise<void> => {
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

  t.is(status, 'error');
  t.is(message, 'requires property "label"');
});

test('invalidate schemas that do not have valid values for properties', async (t: Context): Promise<void> => {
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

  t.is(status, 'error');
  t.is(message, 'is not of a type(s) object');
});
