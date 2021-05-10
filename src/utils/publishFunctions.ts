import prompts from 'prompts';

export type NamedObject = Record<string, string | object>;

export type MetaData = {
  [name: string]: {
    replace?: string;
    returnType: string;
    inputVariables: NamedObject;
  };
};

const resolveMissingFunction = async (
  groomed: MetaData,
  metaData: MetaData,
  name: string,
  defaultInputVariables?: string,
): Promise<MetaData> => {
  const { replace } = await prompts({
    type: 'toggle',
    name: 'replace',
    message: `Function "${name}" is missing. What do you want to do?`,
    initial: false,
    active: 'replace',
    inactive: 'add',
  });

  if (replace) {
    const choices = Object.keys(metaData).filter(key => !groomed[key]);
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
      replacedFunction = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Replace',
        choices: choices.map(key => ({ title: key, value: key })),
        initial: 0,
      })).value;
    }

    // eslint-disable-next-line no-param-reassign
    groomed[name] = metaData[replacedFunction];
    // eslint-disable-next-line no-param-reassign
    groomed[name].replace = replacedFunction;
    // eslint-disable-next-line no-param-reassign
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

    // eslint-disable-next-line no-param-reassign
    groomed[name] = {
      returnType,
      inputVariables: inputVariables.split(/(\s|,)/).reduce(
        (variables: NamedObject, variable: string): NamedObject => {
          if (variable.length) {
            const [varName, varType] = variable.split(':');
            // eslint-disable-next-line no-param-reassign
            variables[varName] = varType;
          }
          return variables;
        },
        {} as NamedObject,
      ),
    };
  }

  return groomed;
};

export { resolveMissingFunction };
