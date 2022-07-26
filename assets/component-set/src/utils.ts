import { showIfTrue } from '@betty-blocks/component-sdk';

export const showOn = (key: string) => ({
  configuration: { condition: showIfTrue(key) },
});
