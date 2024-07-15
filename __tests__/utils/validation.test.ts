import { checkOptionCategoryReferences } from '../../src/utils/validation';
import type { Prefab } from '../../src/types';

type Context = ExecutionContext<unknown>;

test('Throws when option category references do not match an option', () => {
  const prefabs = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          type: 'WRAPPER',
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
          descendants: [
            {
              ref: {
                id: '#textComponent',
              },
              name: 'Text',
              optionCategories: [{ label: 'Category 1', members: ['foo'] }],
              options: [
                {
                  ref: {
                    id: '#textOption',
                  },
                  value: '',
                  label: 'something',
                  key: 'option1',
                  type: 'TEXT',
                },
              ],
              descendants: [],
            },
          ],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => checkOptionCategoryReferences(prefabs)).toThrow();
});
