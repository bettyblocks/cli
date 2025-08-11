import { expect, test } from 'bun:test';

import type { Component, Prefab } from '../../src/types';
import validateComponents from '../../src/validations/component';
import validatePrefabs from '../../src/validations/prefab';

test('Throw when one of the components is invalid', (): void => {
  const components: { name: string }[] = [
    {
      name: 'HelloWorld',
    },
  ];

  expect(() => validateComponents(components as Component[], [])).toThrow();
});

test('Throw when component styleType is not a valid type', (): void => {
  const components = [
    {
      allowedTypes: ['COLUMN'],
      jsx: '<div>jsx</div>',
      name: 'HelloWorld',
      orientation: 'VERTICAL',
      styleType: 'YEET',
      styles: 'styles',
      type: 'ROW',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test('Throw when two components have the same name', (): void => {
  const components = [
    {
      allowedTypes: ['COLUMN'],
      jsx: '<div>jsx</div>',
      name: 'HelloWorld',
      orientation: 'VERTICAL',
      styles: 'styles',
      type: 'ROW',
    },
    {
      allowedTypes: ['COLUMN'],
      jsx: '<div>jsx</div>',
      name: 'HelloWorld',
      orientation: 'VERTICAL',
      styles: 'styles',
      type: 'ROW',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test("Don't throw when all components are valid", (): void => {
  const components = [
    {
      allowedTypes: ['COLUMN'],
      jsx: '<div>jsx</div>',
      name: 'HelloWorld',
      orientation: 'VERTICAL',
      styles: 'styles',
      type: 'ROW',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).not.toThrow();
});

test('Throw when one of the prefabs is invalid', (): void => {
  const prefabs = [
    {
      name: 'Component Name',
    },
  ] as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test("Don't throw when all prefabs are valid", (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'Content',
      icon: 'AccordionIcon',
      name: 'Component Name',
      structure: [],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Throw when one of the prefabs options is invalid', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
              invalid: ' ',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Throw when type partial has descendants', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      descendants: [
        {
          descendants: [],
          type: 'PARTIAL',
        },
      ],
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});
test('Throw when type partial has name', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [
            {
              name: 'Partial',
              type: 'PARTIAL',
            },
          ],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});
test('Throw when type partial has options', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [
            {
              options: [],
              type: 'PARTIAL',
            },
          ],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});
test('Throw when type component has partialId', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [
            {
              descendants: [],
              name: 'Component',
              options: [
                {
                  key: 'partialReferenceId',
                  label: 'Partial Reference',
                  type: 'PARTIAL_REFERENCE',
                  value: '""',
                },
                {
                  key: 'partialInputMapping',
                  label: 'Partial inputs',
                  type: 'PARTIAL_INPUT_OBJECTS',
                  value: '{}',
                },
              ],
              partialId: '',
            },
          ],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Does not throw when partial object is within the structure', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          partialId: '',
          type: 'PARTIAL',
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when wrapper object is within the structure', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          options: [],
          type: 'WRAPPER',
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when nesting wrapper objects', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [
            {
              descendants: [],
              options: [],
              type: 'WRAPPER',
            },
          ],
          options: [],
          type: 'WRAPPER',
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when component option categories with condition', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Text',
          optionCategories: [
            {
              condition: {
                comparator: 'EQ',
                option: 'option2',
                type: 'SHOW',
                value: true,
              },
              label: 'Category 1',
              members: ['option1'],
            },
            {
              condition: {
                comparator: 'EQ',
                option: 'option1',
                type: 'HIDE',
                value: false,
              },
              label: 'Category 2',
              members: ['option2'],
            },
          ],
          options: [
            {
              key: 'option1',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
            {
              key: 'option2',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when component option categories are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Text',
          optionCategories: [
            { label: 'Category 1', members: ['option1'] },
            { label: 'Category 2', members: ['option2'] },
          ],
          options: [
            {
              key: 'option1',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
            {
              key: 'option2',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when wrapper option categories are valid', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          optionCategories: [{ label: 'Category 1', members: ['0'] }],
          options: [
            {
              key: '0',
              type: 'LINKED_OPTION',
              value: {
                ref: {
                  componentId: '#componentId1',
                  optionId: '#componentId1OptionId1',
                },
              },
            },
          ],
          type: 'WRAPPER',
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Throws when component option category has no label', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Text',
          optionCategories: [{ members: ['option1'] }],
          options: [
            {
              key: 'option1',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} }));
});

test('Throws when component option category has no entries', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Text',
          optionCategories: [],
          options: [
            {
              key: 'option1',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} }));
});

test('Throws when component option category members has no entries', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Text',
          optionCategories: [{ label: 'Category 1', members: [] }],
          options: [
            {
              key: 'option1',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} }));
});

test('Does not throw when button prefabs style override options are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Button',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
          style: {
            name: 'filled',
            overwrite: {
              backgroundColor: { type: 'THEME_COLOR', value: 'primary' },
              borderColor: { type: 'STATIC', value: 'yellow' },
              borderRadius: ['0.3125rem'],
              borderStyle: 'dotted',
              borderWidth: ['0.0625rem'],
              boxShadow:
                '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
              color: { type: 'STATIC', value: 'white' },
              fontFamily: 'serif',
              fontSize: '1rem',
              fontStyle: 'italic',
              fontWeight: '300',
              letterSpacing: '0.0625rem',
              lineHeight: '1',
              padding: ['0.5rem', '1rem', '0.5rem', '1rem'],
              textDecoration: 'underline',
              textTransform: 'none',
            },
          },
        },
      ],
    },
  ];

  expect(() =>
    validatePrefabs({
      componentStyleMap: { Button: { styleType: 'BUTTON' } },
      prefabs,
      styles: {},
    }),
  ).not.toThrow();
});

test('Throw when one of the prefabs style override string options is invalid', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Button',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
          style: {
            name: 'filled',
            overwrite: {
              backgroundColor: 1,
            },
          },
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() =>
    validatePrefabs({
      componentStyleMap: { Button: { styleType: 'BUTTON' } },
      prefabs,
      styles: {},
    }),
  );
});

test('Throw when one of the prefabs style override array options is invalid', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          name: 'Button',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
          style: {
            name: 'filled',
            overwrite: {
              padding: ['1', '1', '1', '1', '1'],
            },
          },
        },
      ],
    },
  ];

  expect(() =>
    validatePrefabs({
      componentStyleMap: { Button: { styleType: 'BUTTON' } },
      prefabs,
      styles: {},
    }),
  );
});

test('Throw when style name is non-alphanumeric', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
          style: {
            name: 'invalidCharacter%',
          },
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Dont throw when prefab component has a ref', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'TEXT',
              value: '',
            },
          ],
          ref: {
            id: '#id',
          },
        },
      ],
    },
  ];

  validatePrefabs({ prefabs, styles: {} });
  expect(true).toBe(true);
});

test('Dont throw when prefab component option has a ref', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              ref: { id: '#id' },
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  validatePrefabs({ prefabs, styles: {} });
  expect(true).toBe(true);
});

test('Throw when the prefabs option type is not referring to one the correct types', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'SOMETHING',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Throw when two options with the same key are being used', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'sameKey',
              label: 'Option 1',
              type: 'TEXT',
              value: '',
            },
            {
              key: 'sameKEY',
              label: 'Option 2',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Does not throw when valid partial Prefab', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'partial Prefab',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'sameKey',
              label: 'Option 1',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() =>
    validatePrefabs({
      availableComponentNames: [],
      componentStyleMap: {},
      prefabType: 'partial',
      prefabs,
      styles: {},
    }),
  ).not.toThrow();
});

test('Throw when partialcomponent in partial Prefab', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'partial Prefab',
      structure: [
        {
          partialId: '',
          type: 'PARTIAL',
        },
      ],
    },
  ];

  expect(() =>
    validatePrefabs({
      availableComponentNames: [],
      componentStyleMap: {},
      prefabType: 'partial',
      prefabs,
      styles: {},
    }),
  ).toThrow();
});

test('Throw when type key in partial Prefab', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'partial Prefab',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'sameKey',
              label: 'Option 1',
              type: 'TEXT',
              value: '',
            },
          ],
        },
      ],
      type: 'page',
    },
  ];
  expect(() =>
    validatePrefabs({
      availableComponentNames: [],
      componentStyleMap: {},
      prefabType: 'partial',
      prefabs,
      styles: {},
    }),
  ).toThrow();
});

test("throws an error when a reserved keyword is used 'PARTIAL'", (): void => {
  const components = [
    {
      allowedTypes: ['COLUMN'],
      jsx: '<div>jsx</div>',
      name: 'HelloWorld',
      orientation: 'VERTICAL',
      styles: 'styles',
      type: 'PARTIAL',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test("throws an error when a reserved keyword is used 'WRAPPER'", (): void => {
  const components = [
    {
      allowedTypes: ['COLUMN'],
      jsx: '<div>jsx</div>',
      name: 'HelloWorld',
      orientation: 'VERTICAL',
      styles: 'styles',
      type: 'WRAPPER',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test('Throw when one of the prefabs configuration options is invalid', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              configuration: { allowedKinds: 'TEXT' },
              key: 'something',
              label: 'something',
              type: 'PROPERTY',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Success when the reconfigure configuration options of the prefabs are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              configuration: {
                allowedKinds: ['TEXT', 'URL'],
                createActionInputVariable: {
                  type: 'TEXT',
                },
                createProperty: {
                  type: 'TEXT',
                  value: 'New property',
                },
                disabledNames: ['id', 'created_at', 'updated_at'],
                manageObjectValues: {
                  buttonLabel: 'Manage something',
                  label: 'something',
                  selectableObjectKey: true,
                  value: [
                    { answer: 'yes', boolean: true, score: 100, uuid: '' },
                    { answer: 'no', boolean: false, score: 200, uuid: '' },
                  ],
                },
                pushToWrapper: {
                  condition: {
                    comparator: 'EQ',
                    option: 'option1',
                    type: 'HIDE',
                    value: false,
                  },
                  name: 'wrapperLabel',
                },
                showOnDrop: true,
                showTextStyleColor: true,
              },
              key: 'something',
              label: 'something',
              type: 'PROPERTY',
              value: '',
            },
            {
              configuration: {
                createAction: {
                  name: 'Action name',
                  permissions: 'public',
                  template: 'update',
                  value: '',
                },
                showOnDrop: true,
                showTextStyleColor: true,
              },
              key: 'action',
              label: 'action',
              type: 'ACTION_JS',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when wrapper option has showOnDrop', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          options: [
            {
              configuration: {
                showOnDrop: true,
              },
              key: '0',
              type: 'LINKED_OPTION',
              value: {
                ref: {
                  componentId: '#componentId1',
                  optionId: '#componentId1OptionId1',
                },
              },
            },
            {
              configuration: {
                showOnDrop: true,
              },
              key: '1',
              type: 'LINKED_PARTIAL',
              value: {
                ref: {
                  componentId: '#sideMenuPartial',
                },
              },
            },
          ],
          type: 'WRAPPER',
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Success when the optionRefs of the prefabs are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              optionRef: {
                id: '#something',
                inherit: 'label',
                sourceId: '#otherComp',
              },
              type: 'PROPERTY',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Throws error when value is an empty string in variable option', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'LAYOUT',
      icon: 'PencilIcon',
      name: 'Test Component',
      structure: [
        {
          descendants: [],
          name: 'option',
          options: [
            {
              key: 'key',
              label: 'label',
              type: 'VARIABLE',
              value: '',
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Does not throw when wrapper option has a optionRef', (): void => {
  const prefabs = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component name',
      structure: [
        {
          descendants: [],
          options: [
            {
              configuration: {
                showOnDrop: true,
              },
              key: '0',
              optionRef: {
                id: '#something',
                inherit: 'label',
                sourceId: '#otherComp',
              },
              type: 'LINKED_OPTION',
              value: {
                ref: {
                  componentId: '#componentId1',
                  optionId: '#componentId1OptionId1',
                },
              },
            },
            {
              configuration: {
                showOnDrop: true,
              },
              key: '1',
              optionRef: {
                id: '#something',
                inherit: 'label',
                sourceId: '#otherComp',
              },
              type: 'LINKED_PARTIAL',
              value: {
                ref: {
                  componentId: '#sideMenuPartial',
                },
              },
            },
          ],
          type: 'WRAPPER',
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Success when value is an array with empty string in variable option', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              key: 'something',
              label: 'something',
              type: 'VARIABLE',
              value: [''],
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Success when adding createActionInputVariable in the option configuration of an ACTION_JS_INPUT', (): void => {
  const prefabs: Prefab[] = [
    {
      category: 'CONTENT',
      icon: 'TitleIcon',
      name: 'Component Name',
      structure: [
        {
          descendants: [],
          name: 'something',
          options: [
            {
              configuration: {
                allowedKinds: ['STRING', 'INTEGER'],
                createActionInputVariable: {
                  name: 'Test Name',
                  type: 'STRING',
                },
              },
              key: 'something',
              label: 'something',
              type: 'ACTION_JS_VARIABLE',
              value: [''],
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});
