import {
  ComponentInteraction,
  ComponentInteractionCustom,
  ComponentInteractionType,
  isSpecialEvent,
} from '../repo';

const typeToFunctionName = {
  [ComponentInteractionType.Custom]: 'customFunctionCall',
  [ComponentInteractionType.Global]: 'globalFunctionCall',
  [ComponentInteractionType.Login]: 'loginInteraction',
  [ComponentInteractionType.Toggle]: 'sourceInteraction',
};

const callMap = (
  interactions: ComponentInteraction[],
): Map<string, string[]> => {
  const calls = new Map();

  interactions.forEach((interaction: ComponentInteraction): void => {
    const {
      id,
      type,
      configuration: { sourceEvent },
    } = interaction;

    const functionName = `${typeToFunctionName[type]}${id}`;

    if (calls.has(sourceEvent)) {
      calls.set(sourceEvent, [...calls.get(sourceEvent), functionName]);
    } else {
      calls.set(sourceEvent, [functionName]);
    }
  });

  return calls;
};

const triggerEventTemplate = (calls: string[]): string =>
  `
  const triggerEvent = (name, event, context = null) => {
    const call = { ${calls.join('\n')} }[name];

    if (call) {
      return call(context, event);
    }
  }
  `;

/*

  const triggerEvent = event => {
    const call = {
      Foo: () => { sourceInteractioncf0fa510b8f36634f8f0bf04021df55d() },
    }[event];

    return call();
  };

  */
export default (interactions: ComponentInteraction[]): string => {
  const customInteractions = interactions.filter(
    ({ configuration: { sourceEvent } }: ComponentInteraction): boolean =>
      !isSpecialEvent(sourceEvent),
  );

  if (customInteractions.length === 0) {
    return 'const triggerEvent = () => {};';
  }

  const calls = callMap(customInteractions as ComponentInteractionCustom[]);
  const lines: string[] = [];

  calls.forEach((functions: string[], event: string) => {
    lines.push(
      `    ${event}: (ctx, e1) => { ${functions
        .map((call: string): string => `${call}(ctx, e1)`)
        .join('; ')} },`,
    );
  });

  return triggerEventTemplate(lines);
};
