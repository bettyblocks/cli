import { expect, test } from 'bun:test';

import type { Prefab } from '../../src/types';
import { checkOptionCategoryReferences } from '../../src/utils/validation';

test('Throws when option category references do not match an option', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [
            {
              descendants: [],
              name: 'Text',
              optionCategories: [{ label: 'Category 1', members: ['foo'] }],
              options: [
                {
                  key: 'option1',
                  label: 'something',
                  ref: {
                    id: '#textOption',
                  },
                  type: 'TEXT',
                  value: '',
                },
              ],
              ref: {
                id: '#textComponent',
              },
            },
          ],
          optionCategories: [{ label: 'Category 2', members: ['foo'] }],
          options: [
            {
              key: '0',
              type: 'LINKED_OPTION',
              value: {
                ref: {
                  componentId: '#textComponent',
                  optionId: '#textOption',
                },
              },
            },
          ],
          type: 'WRAPPER',
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => checkOptionCategoryReferences(prefabs)).toThrow();
});
