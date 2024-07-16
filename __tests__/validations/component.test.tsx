import { Component, Prefab } from '../../src/types';
import validateComponents from '../../src/validations/component';
import validatePrefabs from '../../src/validations/prefab';

test('Throw when one of the components is invalid', () => {
  const components: { name: string }[] = [
    {
      name: 'HelloWorld',
    },
  ];

  expect(() => validateComponents(components as Component[], [])).toThrow();
});

test('Throw when component styleType is not a valid type', () => {
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

test('Throw when two components have the same name', () => {
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

test("Don't throw when all components are valid", () => {
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

test('Throw when one of the prefabs is invalid', () => {
  const prefabs = [
    {
      name: 'Component Name',
    },
  ] as Prefab[];

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test("Don't throw when all prefabs are valid", () => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'AccordionIcon',
      category: 'Content',
      structure: [],
    },
  ];

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Throw when one of the prefabs options is invalid', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Throw when type partial has descendants', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});
test('Throw when type partial has name', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});
test('Throw when type partial has options', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});
test('Throw when type component has partialId', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Does not throw when partial object is within the structure', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Does not throw when wrapper object is within the structure', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Does not throw when nesting wrapper objects', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Does not throw when component option categories with condition', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Does not throw when component option categories are valid', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Does not throw when wrapper option categories are valid', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Throws when component option category has no label', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Throws when component option category has no entries', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Throws when component option category members has no entries', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Does not throw when button prefabs style override options are valid', () => {
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
    validatePrefabs(prefabs, {}, { Button: { styleType: 'BUTTON' } }),
  ).not.toThrow();
});

test('Throw when one of the prefabs style override string options is invalid', () => {
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
    validatePrefabs(prefabs, {}, { Button: { styleType: 'BUTTON' } }),
  ).toThrow();
});

test('Throw when one of the prefabs style override array options is invalid', () => {
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
    validatePrefabs(prefabs, {}, { Button: { styleType: 'BUTTON' } }),
  ).toThrow();
});

test('Throw when style name is non-alphanumeric', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Dont throw when prefab component has a ref', () => {
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

  validatePrefabs(prefabs, {});
});

test('Dont throw when prefab component option has a ref', () => {
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

  validatePrefabs(prefabs, {});
});

test('Throw when the prefabs option type is not referring to one the correct types', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Throw when two options with the same key are being used', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Does not throw when valid partial Prefab', () => {
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

  validatePrefabs(prefabs, {}, {}, 'partial');
});

test('Throw when partialcomponent in partial Prefab', () => {
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

  expect(() => validatePrefabs(prefabs, {}, {}, 'partial')).toThrow();
});

test('Throw when type key in partial Prefab', () => {
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
  expect(() => validatePrefabs(prefabs, {}, {}, 'partial')).toThrow();
});

test("throws an error when a reserved keyword is used 'PARTIAL'", () => {
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

test("throws an error when a reserved keyword is used 'WRAPPER'", () => {
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

test('Throw when one of the prefabs configuration options is invalid', () => {
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

  expect(() => validatePrefabs(prefabs, {})).toThrow();
});

test('Success when the reconfigure configuration options of the prefabs are valid', () => {
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
                createProperty: {
                  type: 'TEXT',
                  value: 'New property',
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Does not throw when wrapper option has showOnDrop', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Success when the optionRefs of the prefabs are valid', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});

test('Does not throw when wrapper option has a optionRef', () => {
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

  expect(() => validatePrefabs(prefabs, {})).not.toThrow();
});
