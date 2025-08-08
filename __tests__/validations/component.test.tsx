import { test, expect } from 'bun:test';

import { Component, Prefab } from '../../src/types';
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
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
      styleType: 'YEET',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test('Throw when two components have the same name', (): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test("Don't throw when all components are valid", (): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'ROW',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
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
      name: 'Component Name',
      icon: 'AccordionIcon',
      category: 'Content',
      structure: [],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Throw when one of the prefabs options is invalid', (): void => {
  const prefabs = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
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
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [
            {
              type: 'PARTIAL',
              descendants: [],
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
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [
            {
              name: 'Partial',
              type: 'PARTIAL',
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
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [
            {
              type: 'PARTIAL',
              options: [],
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
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [
            {
              name: 'Component',
              partialId: '',
              options: [
                {
                  type: 'PARTIAL_REFERENCE',
                  label: 'Partial Reference',
                  key: 'partialReferenceId',
                  value: '""',
                },
                {
                  type: 'PARTIAL_INPUT_OBJECTS',
                  label: 'Partial inputs',
                  key: 'partialInputMapping',
                  value: '{}',
                },
              ],
              descendants: [],
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
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          type: 'PARTIAL',
          partialId: '',
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when wrapper object is within the structure', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          type: 'WRAPPER',
          options: [],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when nesting wrapper objects', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          type: 'WRAPPER',
          options: [],
          descendants: [
            {
              type: 'WRAPPER',
              options: [],
              descendants: [],
            },
          ],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when component option categories with condition', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Text',
          optionCategories: [
            {
              label: 'Category 1',
              members: ['option1'],
              condition: {
                type: 'SHOW',
                option: 'option2',
                comparator: 'EQ',
                value: true,
              },
            },
            {
              label: 'Category 2',
              members: ['option2'],
              condition: {
                type: 'HIDE',
                option: 'option1',
                comparator: 'EQ',
                value: false,
              },
            },
          ],
          options: [
            {
              value: '',
              label: 'something',
              key: 'option1',
              type: 'TEXT',
            },
            {
              value: '',
              label: 'something',
              key: 'option2',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when component option categories are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Text',
          optionCategories: [
            { label: 'Category 1', members: ['option1'] },
            { label: 'Category 2', members: ['option2'] },
          ],
          options: [
            {
              value: '',
              label: 'something',
              key: 'option1',
              type: 'TEXT',
            },
            {
              value: '',
              label: 'something',
              key: 'option2',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when wrapper option categories are valid', (): void => {
  const prefabs = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          type: 'WRAPPER',
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
          descendants: [],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Throws when component option category has no label', (): void => {
  const prefabs = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Text',
          optionCategories: [{ members: ['option1'] }],
          options: [
            {
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
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} }));
});

test('Throws when component option category has no entries', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Text',
          optionCategories: [],
          options: [
            {
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
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} }));
});

test('Throws when component option category members has no entries', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Text',
          optionCategories: [{ label: 'Category 1', members: [] }],
          options: [
            {
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
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} }));
});

test('Does not throw when button prefabs style override options are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Button',
          style: {
            name: 'filled',
            overwrite: {
              backgroundColor: {
                type: 'THEME_COLOR',
                value: 'primary',
              },
              color: {
                type: 'STATIC',
                value: 'white',
              },
              borderColor: {
                type: 'STATIC',
                value: 'yellow',
              },
              borderRadius: ['0.3125rem'],
              borderStyle: 'dotted',
              borderWidth: ['0.0625rem'],
              boxShadow:
                '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
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
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() =>
    validatePrefabs({
      prefabs,
      styles: {},
      componentStyleMap: { Button: { styleType: 'BUTTON' } },
    }),
  ).not.toThrow();
});

test('Throw when one of the prefabs style override string options is invalid', (): void => {
  const prefabs = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Button',
          style: {
            name: 'filled',
            overwrite: {
              backgroundColor: 1,
            },
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() =>
    validatePrefabs({
      prefabs,
      styles: {},
      componentStyleMap: { Button: { styleType: 'BUTTON' } },
    }),
  );
});

test('Throw when one of the prefabs style override array options is invalid', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'Button',
          style: {
            name: 'filled',
            overwrite: {
              padding: ['1', '1', '1', '1', '1'],
            },
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() =>
    validatePrefabs({
      prefabs,
      styles: {},
      componentStyleMap: { Button: { styleType: 'BUTTON' } },
    }),
  );
});

test('Throw when style name is non-alphanumeric', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          style: {
            name: 'invalidCharacter%',
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Dont throw when prefab component has a ref', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          ref: {
            id: '#id',
          },
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
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
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              ref: {
                id: '#id',
              },
              label: 'something',
              key: 'something',
              type: 'TEXT',
            },
          ],
          descendants: [],
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
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'SOMETHING',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Throw when two options with the same key are being used', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'Option 1',
              key: 'sameKey',
              type: 'TEXT',
            },
            {
              value: '',
              label: 'Option 2',
              key: 'sameKEY',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Does not throw when valid partial Prefab', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'partial Prefab',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'Option 1',
              key: 'sameKey',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() =>
    validatePrefabs({
      prefabs,
      styles: {},
      componentStyleMap: {},
      availableComponentNames: [],
      prefabType: 'partial',
    }),
  ).not.toThrow();
});

test('Throw when partialcomponent in partial Prefab', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'partial Prefab',
      icon: 'TitleIcon',
      category: 'CONTENT',
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
      prefabs,
      styles: {},
      componentStyleMap: {},
      availableComponentNames: [],
      prefabType: 'partial',
    }),
  ).toThrow();
});

test('Throw when type key in partial Prefab', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'partial Prefab',
      icon: 'TitleIcon',
      type: 'page',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'Option 1',
              key: 'sameKey',
              type: 'TEXT',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];
  expect(() =>
    validatePrefabs({
      prefabs,
      styles: {},
      componentStyleMap: {},
      availableComponentNames: [],
      prefabType: 'partial',
    }),
  ).toThrow();
});

test("throws an error when a reserved keyword is used 'PARTIAL'", (): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'PARTIAL',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test("throws an error when a reserved keyword is used 'WRAPPER'", (): void => {
  const components = [
    {
      name: 'HelloWorld',
      type: 'WRAPPER',
      allowedTypes: ['COLUMN'],
      orientation: 'VERTICAL',
      jsx: '<div>jsx</div>',
      styles: 'styles',
    },
  ] as Component[];

  expect(() => validateComponents(components, [])).toThrow();
});

test('Throw when one of the prefabs configuration options is invalid', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'PROPERTY',
              configuration: {
                allowedKinds: 'TEXT',
              },
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Success when the reconfigure configuration options of the prefabs are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'PROPERTY',
              configuration: {
                allowedKinds: ['TEXT', 'URL'],
                disabledNames: ['id', 'created_at', 'updated_at'],
                createProperty: {
                  type: 'TEXT',
                  value: 'New property',
                },
                createActionInputVariable: {
                  type: 'TEXT',
                },
                manageObjectValues: {
                  selectableObjectKey: true,
                  buttonLabel: 'Manage something',
                  label: 'something',
                  value: [
                    { uuid: '', answer: 'yes', score: 100, boolean: true },
                    { uuid: '', answer: 'no', score: 200, boolean: false },
                  ],
                },
                showOnDrop: true,
                showTextStyleColor: true,
                pushToWrapper: {
                  name: 'wrapperLabel',
                  condition: {
                    type: 'HIDE',
                    option: 'option1',
                    comparator: 'EQ',
                    value: false,
                  },
                },
              },
            },
            {
              value: '',
              label: 'action',
              key: 'action',
              type: 'ACTION_JS',
              configuration: {
                createAction: {
                  template: 'update',
                  name: 'Action name',
                  permissions: 'public',
                  value: '',
                },
                showOnDrop: true,
                showTextStyleColor: true,
              },
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Does not throw when wrapper option has showOnDrop', (): void => {
  const prefabs = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          type: 'WRAPPER',
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
              configuration: {
                showOnDrop: true,
              },
            },
            {
              key: '1',
              type: 'LINKED_PARTIAL',
              value: {
                ref: {
                  componentId: '#sideMenuPartial',
                },
              },
              configuration: {
                showOnDrop: true,
              },
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Success when the optionRefs of the prefabs are valid', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: '',
              label: 'something',
              key: 'something',
              type: 'PROPERTY',
              optionRef: {
                id: '#something',
                sourceId: '#otherComp',
                inherit: 'label',
              },
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Throws error when value is an empty string in variable option', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Test Component',
      icon: 'PencilIcon',
      category: 'LAYOUT',
      structure: [
        {
          name: 'option',
          options: [
            {
              value: '',
              label: 'label',
              key: 'key',
              type: 'VARIABLE',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).toThrow();
});

test('Does not throw when wrapper option has a optionRef', (): void => {
  const prefabs = [
    {
      name: 'Component name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          type: 'WRAPPER',
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
              optionRef: {
                id: '#something',
                sourceId: '#otherComp',
                inherit: 'label',
              },
              configuration: {
                showOnDrop: true,
              },
            },
            {
              key: '1',
              type: 'LINKED_PARTIAL',
              value: {
                ref: {
                  componentId: '#sideMenuPartial',
                },
              },
              optionRef: {
                id: '#something',
                sourceId: '#otherComp',
                inherit: 'label',
              },
              configuration: {
                showOnDrop: true,
              },
            },
          ],
          descendants: [],
        },
      ],
    },
  ] as unknown as Prefab[];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Success when value is an array with empty string in variable option', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: [''],
              label: 'something',
              key: 'something',
              type: 'VARIABLE',
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});

test('Success when adding createActionInputVariable in the option configuration of an ACTION_JS_INPUT', (): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'TitleIcon',
      category: 'CONTENT',
      structure: [
        {
          name: 'something',
          options: [
            {
              value: [''],
              label: 'something',
              key: 'something',
              type: 'ACTION_JS_VARIABLE',
              configuration: {
                allowedKinds: ['STRING', 'INTEGER'],
                createActionInputVariable: {
                  name: 'Test Name',
                  type: 'STRING',
                },
              },
            },
          ],
          descendants: [],
        },
      ],
    },
  ];

  expect(() => validatePrefabs({ prefabs, styles: {} })).not.toThrow();
});
