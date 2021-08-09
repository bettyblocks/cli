import jsesc from 'jsesc';
import {
  BaseComponentInteraction,
  ComponentInteraction,
  ComponentInteractionCustom,
  ComponentInteractionGlobal,
  ComponentInteractionLogin,
  ComponentInteractionToggle,
  ComponentInteractionType,
  isCustomInteraction,
  isGlobalInteraction,
  isLoginInteraction,
  isToggleInteraction,
  OptionArgument,
  Parameter,
  PageArgumentParameters,
} from '../repo';
import defineTriggerEvent from './triggerEvent';

export interface InteractionsCategorized {
  customSources: ComponentInteractionCustom[];
  customTargets: ComponentInteractionCustom[];
  globalSources: ComponentInteractionGlobal[];
  globalTargets: ComponentInteractionGlobal[];
  logins: ComponentInteractionLogin[];
  toggleSources: ComponentInteractionToggle[];
  toggleTargets: ComponentInteractionToggle[];
}

export const CONTEXT = '__SECRET_CONTEXT_DO_NOT_USE';
export const STATE = '__SECRET_STATE_DO_NOT_USE';
export const CUSTOM_FUNC_INDEX = '__SECRET_FUNC_INDEX_DO_NOT_USE';
export const SET_STATE = '__SECRET_SET_STATE_DO_NOT_USE';
export const ID = '__SECRET_ID_DO_NOT_USE';
export const EMITTER_CONTEXT = '__SECRET_EMITTER_CONTEXT_DO_NOT_USE';

const getLastPath = (name: string): string => name.replace(/.*\./, '');

function deserializeParameters(
  arr: PageArgumentParameters[],
): Record<string, string> {
  return (arr || []).reduce(
    (acc, { name, value }) => ({
      ...acc,
      [getLastPath(name)]: value.map(v => JSON.parse(v)),
    }),
    {},
  );
}

const definePageParameters = (parameters: Parameter[]): string[] => {
  const pageParameterDefenitions: string[] = [];
  parameters.forEach(arg => {
    let params = {};
    if ('parameters' in arg) {
      params = deserializeParameters(arg.parameters);
    }
    if ('pageId' in arg && arg.pageId != null) {
      const variableName = `${getLastPath(arg.parameter)}_page`;
      pageParameterDefenitions.push(
        `const ${variableName} = B.usePage({id: "${
          arg.pageId
        }", params: ${jsesc(params)}});`,
      );
    }
  });

  return pageParameterDefenitions;
};

const defineParameterProperty = (
  arg: Parameter,
  path: string[],
  useContext = false,
): string => {
  const parameterProperty = `${getLastPath(arg.parameter)}_property`;

  if ('resolveValue' in arg && arg.resolveValue !== null && !arg.resolveValue) {
    return `let ${parameterProperty} = { id: ${jsesc(path)}, ${'operator' in
      arg && `operator: '${jsesc(arg.operator)}'`} }`;
  }

  if (useContext) {
    return `${parameterProperty} = B.resolveProperty(context, ${jsesc(path)})`;
  }

  return `let ${parameterProperty} = B.useProperty(${jsesc(path)})`;
};

const definePropertiesAndOptions = (
  parameters: Parameter[],
  useContext = false,
): [string[], OptionArgument[]] => {
  const propertyDefinitions: string[] = [];
  const optionArguments: OptionArgument[] = [];

  parameters.forEach(arg => {
    if ('componentId' in arg && arg.componentId !== null) {
      optionArguments.push(arg);
      return;
    }

    let path = [];

    if (arg != null && 'id' in arg) {
      path = Array.isArray(arg.id) ? arg.id : [arg.id];
    } else {
      path = (arg as any).path;
    }

    propertyDefinitions.push(defineParameterProperty(arg, path, useContext));
  });

  return [propertyDefinitions, optionArguments];
};

export const registerOptionTarget = ({
  id,
  configuration: { targetOptionName },
}: BaseComponentInteraction<
  ComponentInteractionType.Global | ComponentInteractionType.Toggle
>): string => `
if (typeof options['${targetOptionName}'] !== 'undefined'
    && ${STATE}.interactions['${id}'] !== options['${targetOptionName}']) {
  ${SET_STATE}(state => {
    return {
      ...state,
      interactions: {
        ...state.interactions,
        '${id}': options['${targetOptionName}'],
      }
    };
  });
}
if (typeof ${STATE}.interactions['${id}'] !== 'undefined') {
  options['${targetOptionName}'] = ${STATE}.interactions['${id}'];
}`;

export const registerNewOptionTarget = (
  interaction: BaseComponentInteraction<
    ComponentInteractionType.Global | ComponentInteractionType.Toggle
  >,
): string => {
  const interactionFunction =
    'function' in interaction.configuration
      ? interaction.configuration.function
      : interaction.function;
  const {
    id,
    configuration: { targetOptionName },
  } = interaction;
  return `
    globalEventEmitter.on('${id}', (...args) => {
      const f = ${interactionFunction};
      ${
        targetOptionName
          ? `B.updateOption('${targetOptionName}', f(...args));`
          : `f(...args);`
      }
      
    })
`;
};

export const registerOptionTargets = (
  interactions: BaseComponentInteraction<
    ComponentInteractionType.Global | ComponentInteractionType.Toggle
  >[],
): string => `
useEffect(() => {
  ${interactions.map(registerNewOptionTarget).join('\n')}
}, [])
`;

export const defineToggleSource = ({ id }: ComponentInteraction): string => `
const sourceInteraction${id} = () => {
  ${SET_STATE}(state => {
    if (typeof state.interactions['${id}'] !== 'boolean') {
      throw new TypeError('Interaction value \\'' + state.interactions['${id}'] + '\\' is not a boolean');
    }

    return {
      ...state,
      interactions: {
        ...state.interactions,
        '${id}': !state.interactions['${id}'],
      },
    };
  });
}`;

export const defineToggleSources = (
  interactions: ComponentInteraction[],
): string => interactions.map(defineToggleSource).join('\n');

export const defineCustomFunctionCall = ({
  id,
  configuration: { name, parameters = [] },
}: ComponentInteractionCustom): string => {
  const [propertyDefinitions, optionArguments] = definePropertiesAndOptions(
    parameters,
  );

  return `
  const { current: optionIndex } = useContext(global.__SECRET_ROOT_CONTEXT_DO_NOT_USE);
  const parameters = ${jsesc(optionArguments)};

  ${propertyDefinitions.join('\n')}

  ${definePageParameters(parameters).join('\n')}

  useEffect(() => {
    Object.entries(options).forEach(([name, value]) => {
      optionIndex.set(\`\${${ID}}_\${name}\`, value);
    });
  }, [options]);

  const customFunctionCall${id} = (context, event) => {

    const optionArguments = parameters.reduce((acc, src) => {
      const key = \`\${src.componentId || ${ID}}_\${src.name}\`;
      let option = optionIndex.get(key);
      return ({
        ...acc,
        [src.parameter]: option,
      });
    }, {});

    const propertyArguments = {
      ${parameters
        .filter(arg => (arg as any).id || (arg as any).path)
        .map(
          ({ parameter }) =>
            `${getLastPath(parameter)}: ${getLastPath(parameter)}_property,`,
        )
        .join('\n')}
    };

    const pageArguments = {
      ${parameters
        .filter(arg => 'pageId' in arg && arg.pageId != null)
        .map(({ parameter }) => `${parameter}: ${parameter}_page,`)
        .join('\n')}
    };

    const customArguments = ${
      parameters.length > 0
        ? `Object.assign({ event }, optionArguments, propertyArguments, pageArguments, { interactionId: '${id}'});`
        : 'event'
    }

    emitter.emit("${name}_${id}", { args: [customArguments]});
  }`;
};

export const defineCustomFunctionCalls = (
  interactions: ComponentInteractionCustom[],
): string => `
const emitter = useContext(global.${EMITTER_CONTEXT});

if (!emitter) {
  console.error('component outside of interaction scope');
}

${interactions.map(defineCustomFunctionCall).join('\n')}
`;

export const defineGlobalFunctionCall = (
  interaction: ComponentInteractionGlobal,
): string => {
  const {
    id,
    configuration: { parameters = [] },
  } = interaction;

  const [propertyDefinitions, optionArguments] = definePropertiesAndOptions(
    parameters,
  );

  return `
  const { current: optionIndex } = useContext(global.__SECRET_ROOT_CONTEXT_DO_NOT_USE);
  const parameters = ${jsesc(optionArguments)};

  ${propertyDefinitions.join('/n')}

  ${definePageParameters(parameters).join('/n')}

  useEffect(() => {
    Object.entries(options).forEach(([name, value]) => {
      optionIndex.set(\`\${${ID}}_\${name}\`, value);
    });
  }, [options]);

  const globalFunctionCall${id} = (context, event) => {
    if(event && typeof event === 'object' && event.persist) {
      event.persist();
    }

    if (context) {
      ${definePropertiesAndOptions(parameters, true)[0].join('\n')}
    }

    const optionArguments = parameters.reduce((acc, src) => {
      const key = \`\${src.componentId || ${ID}}_\${src.name}\`;
      let option = optionIndex.get(key);
      return ({
        ...acc,
        [src.parameter]: option,
      });
    }, {});

    const propertyArguments = {
      ${parameters
        .filter(arg => (arg as any).id || (arg as any).path)
        .map(({ parameter }) => `${parameter}: ${parameter}_property,`)
        .join('\n')}
    };

    const pageArguments = {
      ${parameters
        .filter(arg => 'pageId' in arg && arg.pageId != null)
        .map(({ parameter }) => `${parameter}: ${parameter}_page,`)
        .join('\n')}
    };

    const globalArguments = Object.assign({event}, optionArguments, propertyArguments, pageArguments);

    globalEventEmitter.emit('${id}', { args: [globalArguments] });
  }`;
};

export const defineGlobalFunctionCalls = (
  interactions: ComponentInteractionGlobal[],
): string => interactions.map(defineGlobalFunctionCall).join('\n');

export const appendCustomFunction = ({ id }: ComponentInteraction): string =>
  `['${id}']: {
          ...(functions && functions['${id}'] ? functions['${id}'] : {}),
          [name]: callback
        },`;

export const exposeDefineFunction = (
  interactions: ComponentInteraction[],
): string => `
const definedFunctionsRef = useRef({});

useEffect(() => {
  return () => {
    const definedFunctionNames = Object.keys(definedFunctionsRef.current);
    definedFunctionNames.map(key => {
      const subs = emitter.subscribers[key];
      if (subs) subs.clear();
    });
  }
}, [])

const defineFunction = (name, callback) => {
  const definedFunctions = definedFunctionsRef.current;

  const receiver = (...args) => {
    callback.apply(this, args);
  }

  ${interactions
    .filter(
      (i): i is ComponentInteractionCustom =>
        i.type === ComponentInteractionType.Custom,
    )
    .map(
      ({ id, configuration: { name } }) => `
    if ("${name}" === name) {
      const key = \`\${name}_${id}\`;

      emitter.off(key, definedFunctions[key]);
      emitter.on(key, receiver)

      definedFunctions[key] = receiver;
    }
    `,
    )
    .join('\n')}
  };
`;

export const defineLoginFunction = ({
  id,
  configuration: { endpointId },
}: ComponentInteractionLogin): string => `
const loginInteraction${id} = (data, actionId, apiVersion) => {
  const isJWT = input => {
    if (typeof(input) == 'string') {
      const parts = input.split('.');
      return parts.length === 3 && input.startsWith('ey');
    }
    return false;
  };

  const resolveTokens = data => {
    let jwtToken, refreshToken;

    if (data.isValid) {
      isJWT(data.jwtToken)     && (jwtToken     = data.jwtToken);
      isJWT(data.refreshToken) && (refreshToken = data.refreshToken);
    } else {
      isJWT(data) && (jwtToken = data);
    }

    return {jwtToken, refreshToken};
  };

  const identifier = apiVersion === 'v1' ? 'actionb5' : 'interaction' + actionId;

  if (data && data[identifier]) {
    const { jwtToken, refreshToken } = resolveTokens(data[identifier]);

    jwtToken     && localStorage.setItem('TOKEN', jwtToken);
    refreshToken && localStorage.setItem('REFRESH_TOKEN', refreshToken);

    const endpoint = B.getEndpoint('${endpointId.toLowerCase()}');
    history.push(endpoint.url);
  }
}`;

export const defineLoginFunctions = (
  interactions: ComponentInteractionLogin[],
): string => interactions.map(defineLoginFunction).join('\n');

export const categorizeInteractions = (
  source: ComponentInteraction[],
  target: ComponentInteraction[],
): InteractionsCategorized => {
  const out = {
    customSources: [],
    customTargets: [],
    globalSources: [],
    globalTargets: [],
    logins: [],
    toggleSources: [],
    toggleTargets: [],
  } as InteractionsCategorized;

  source.forEach((interaction: ComponentInteraction): void => {
    if (isCustomInteraction(interaction)) {
      out.customSources.push(interaction);
    } else if (isGlobalInteraction(interaction)) {
      out.globalSources.push(interaction);
    } else if (isLoginInteraction(interaction)) {
      out.logins.push(interaction);
    } else if (isToggleInteraction(interaction)) {
      out.toggleSources.push(interaction);
    }
  });

  target.forEach((interaction: ComponentInteraction): void => {
    if (isCustomInteraction(interaction)) {
      out.customTargets.push(interaction);
    } else if (isGlobalInteraction(interaction)) {
      out.globalTargets.push(interaction);
    } else if (isToggleInteraction(interaction)) {
      out.toggleTargets.push(interaction);
    }
  });

  return out;
};

export default (
  source: ComponentInteraction[] = [],
  target: ComponentInteraction[] = [],
): string => {
  if (target.length === 0 && source.length === 0) {
    return `
    const defineFunction = () => {};
    const triggerEvent = () => {};
    `;
  }

  const {
    customSources,
    customTargets,
    globalSources,
    globalTargets,
    logins,
    toggleSources,
    toggleTargets,
  } = categorizeInteractions(source, target);

  return [
    `const [${STATE}, ${SET_STATE}, ${CUSTOM_FUNC_INDEX}] = useContext(global.${CONTEXT});\n`,
    'const history = useHistory();',
    defineToggleSources(toggleSources),
    registerOptionTargets(toggleTargets),
    defineLoginFunctions(logins),
    defineCustomFunctionCalls(customSources),
    defineGlobalFunctionCalls(globalSources),
    registerOptionTargets(globalTargets),
    customTargets.length > 0
      ? exposeDefineFunction(customTargets)
      : `
const defineFunction = () => {};
`,
    defineTriggerEvent(source),
  ].join('');
};
