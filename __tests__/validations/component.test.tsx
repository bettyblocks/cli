import test, { ExecutionContext } from 'ava';

import { Component, Prefab } from '../../src/types';
import validateComponents from '../../src/validations/component';
import validatePrefabs from '../../src/validations/prefab';

type Context = ExecutionContext<unknown>;

test('Throw when one of the components is invalid', (t: Context): void => {
  const components: { name: string }[] = [
    {
      name: 'HelloWorld',
    },
  ];

  t.throws(() => validateComponents(components as Component[], []));
});

test('Throw when component styleType is not a valid type', (t: Context): void => {
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

  t.throws(() => validateComponents(components, []));
});

test('Throw when two components have the same name', (t: Context): void => {
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

  t.throws(() => validateComponents(components, []));
});

test("Don't throw when all components are valid", (t: Context): void => {
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

  t.notThrows(() => validateComponents(components, []));
});

test('Throw when one of the prefabs is invalid', (t: Context): void => {
  const prefabs = [
    {
      name: 'Component Name',
    },
  ] as Prefab[];

  t.throws(() => validatePrefabs(prefabs, {}));
});

test("Don't throw when all prefabs are valid", (t: Context): void => {
  const prefabs: Prefab[] = [
    {
      name: 'Component Name',
      icon: 'AccordionIcon',
      category: 'Content',
      structure: [],
    },
  ];

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Throw when one of the prefabs options is invalid', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Throw when type partial has descendants', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});
test('Throw when type partial has name', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});
test('Throw when type partial has options', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});
test('Throw when type component has partialId', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when partial object is within the structure', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when wrapper object is within the structure', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when nesting wrapper objects', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when component option categories with condition', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when component option categories are valid', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when wrapper option categories are valid', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Throws when component option category has no label', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Throws when component option category has no entries', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Throws when component option category members has no entries', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when button prefabs style override options are valid', (t: Context): void => {
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

  t.notThrows(() =>
    validatePrefabs(prefabs, {}, { Button: { styleType: 'BUTTON' } }),
  );
});

test('Throw when one of the prefabs style override string options is invalid', (t: Context): void => {
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

  t.throws(() =>
    validatePrefabs(prefabs, {}, { Button: { styleType: 'BUTTON' } }),
  );
});

test('Throw when one of the prefabs style override array options is invalid', (t: Context): void => {
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

  t.throws(() =>
    validatePrefabs(prefabs, {}, { Button: { styleType: 'BUTTON' } }),
  );
});

test('Throw when style name is non-alphanumeric', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Dont throw when prefab component has a ref', (t: Context): void => {
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
  t.pass();
});

test('Dont throw when prefab component option has a ref', (t: Context): void => {
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
  t.pass();
});

test('Throw when the prefabs option type is not referring to one the correct types', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Throw when two options with the same key are being used', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when valid partial Prefab', (t: Context): void => {
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
  t.pass();
});

test('Throw when partialcomponent in partial Prefab', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}, {}, 'partial'));
});

test('Throw when type key in partial Prefab', (t: Context): void => {
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
  t.throws(() => validatePrefabs(prefabs, {}, {}, 'partial'));
});

test("throws an error when a reserved keyword is used 'PARTIAL'", (t: Context): void => {
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

  t.throws(() => validateComponents(components, []));
});

test("throws an error when a reserved keyword is used 'WRAPPER'", (t: Context): void => {
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

  t.throws(() => validateComponents(components, []));
});

test('Throw when one of the prefabs configuration options is invalid', (t: Context): void => {
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

  t.throws(() => validatePrefabs(prefabs, {}));
});

test('Success when the reconfigure configuration options of the prefabs are valid', (t: Context): void => {
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
                  label: 'foo',
                  buttonLabel: 'bar',
                  selectableObjectKey: true,
                  value: [
                    { uuid: '', answer: 'yes', score: 100, boolean: true },
                    { uuid: '', answer: 'no', score: 200, boolean: false },
                  ],
                },
                showOnDrop: true,
                showTextStyleColor: true,
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when wrapper option has showOnDrop', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Success when the optionRefs of the prefabs are valid', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});

test('Does not throw when wrapper option has a optionRef', (t: Context): void => {
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

  t.notThrows(() => validatePrefabs(prefabs, {}));
});
