import prompts from 'prompts';

import IDE from '../utils/ide';

export type NamedObject = Record<string, string | object>;

export type MetaData = Record<
  string,
  {
    replace?: string;
    returnType: string;
    inputVariables: NamedObject;
  }
>;

export interface CustomFunction {
  id: string;
  name: string;
  revision: number;
}

export type CustomFunctions = CustomFunction[];

const resolveMissingFunction = async (
  groomed: MetaData,
  metaData: MetaData,
  name: string,
  defaultInputVariables?: string,
): Promise<MetaData> => {
  const { replace } = (await prompts({
    type: 'toggle',
    name: 'replace',
    message: `Function "${name}" is missing. What do you want to do?`,
    initial: false,
    active: 'replace',
    inactive: 'add',
  })) as { replace: boolean };

  if (replace) {
    const choices = Object.keys(metaData).filter((key) => !groomed[key]);
    let replacedFunction;

    if (choices.length === 1) {
      const confirm = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Replace "${choices[0]}"?`,
        initial: true,
      });
      if (confirm.value) [replacedFunction] = choices;
      else throw new Error('Abort.');
    } else {
      replacedFunction = (
        await prompts({
          type: 'select',
          name: 'value',
          message: 'Replace',
          choices: choices.map((key) => ({ title: key, value: key })),
          initial: 0,
        })
      ).value;
    }

    groomed[name] = metaData[replacedFunction];

    groomed[name].replace = replacedFunction;

    delete metaData[replacedFunction];
  } else {
    const { returnType, inputVariables } = await prompts([
      {
        type: 'select',
        name: 'returnType',
        message: `What is the return type of the function?`,
        choices: [
          { title: 'string', value: 'string' },
          { title: 'integer', value: 'integer' },
          { title: 'boolean', value: 'boolean' },
        ],
        initial: 0,
      } as prompts.PromptObject,
      {
        type: 'text',
        name: 'inputVariables',
        message: 'What are the input variables? (`name:type name:type ...`)',
        initial: defaultInputVariables,
      } as prompts.PromptObject,
    ]);

    groomed[name] = {
      returnType,

      inputVariables: inputVariables
        .split(/(\s|,)/)
        .reduce((variables: NamedObject, variable: string): NamedObject => {
          if (variable.length) {
            const [varName, varType] = variable.split(':');

            variables[varName] = varType;
          }
          return variables;
        }, {} as NamedObject),
    };
  }

  return groomed;
};

const storeCustomFunctions = async (
  ide: IDE,
  metaData: MetaData,
  bumpRevision?: boolean,
): Promise<number> => {
  const customFunctions = (await ide.get(
    'bootstrap/custom_functions',
  )) as CustomFunctions;

  const revision =
    customFunctions.reduce((rev, func) => Math.max(rev, func.revision), 0) +
    (bumpRevision ? 1 : 0);

  const ids: NamedObject = customFunctions.reduce(
    (map, { id, name }) => ({ ...map, [name]: id }),
    {},
  );

  await Object.keys(metaData).reduce(
    async (promise: Promise<string | object | null>, name: string) => {
      await promise;
      const { replace, returnType, inputVariables } = metaData[name];
      const id = ids[replace || name];
      const method = id ? 'put' : 'post';
      const action = id ? 'Updating' : 'Creating';
      const params = {
        name,
        revision,
        return_type: returnType,
        input_variables: inputVariables,
      };
      return ide[method](
        `custom_functions/${id || 'new'}`,
        { json: { record: params } },
        `${action} custom function "${replace || name}" ...`,
      );
    },
    Promise.resolve(null),
  );

  return revision;
};

export { resolveMissingFunction, storeCustomFunctions };
