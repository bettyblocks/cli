import test, { ExecutionContext } from 'ava';
import { validateFunction } from '../../src/utils/validateFunction';
import { ValidationError, Validator } from 'jsonschema';

type Context = ExecutionContext<unknown>;

const schema = {
  "$id": "/schema/actions/function.json",
  "title": "Function",
  "properties": {
    "name": {
      "type": "string"
    },
    "icon": {
      "enum": ["CreateIcon", "DeleteIcon"]
    }
  },
  "required": ["name"]
}

const validator = new Validator();
validator.addSchema(schema, schema.$id);

test('load in entire schema for validator', async (t: Context): Promise<void> => {
  const functionJson = {
    "name": "create",
    "icon": "CreateIcon"
  }

  const {status, errors} = await validateFunction(functionJson, validator);

  t.is(status, 'ok');
  t.is(errors.length, 0);
});

test('invalidate empty schemas', async (t: Context): Promise<void> => {
  const {status, errors: [{message}]} = await validateFunction({}, validator);

  t.is(status, 'error');
  t.is(message, 'requires property "name"');
});

test('invalidate schemas that do not have valid values for properties', async (t: Context): Promise<void> => {
  const functionJson = {
    "name": "create",
    "icon": "RandomIcon"
  }

  const {status, errors: [{message}]} = await validateFunction(functionJson, validator);

  t.is(status, 'error');
  t.is(message, 'is not one of enum values: CreateIcon,DeleteIcon');
});