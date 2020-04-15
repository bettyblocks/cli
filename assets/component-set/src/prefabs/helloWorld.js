(() => ({
  name: 'HelloWorld',
  icon: 'TitleIcon',
  category: 'ELEMENTS',
  structure: [
    {
      name: 'HelloWorld',
      options: [
        {
          type: 'FONT',
          label: 'Type',
          key: 'type',
          value: 'Title1',
        },
        {
          type: 'TEXT',
          label: 'Content',
          key: 'content',
          value: 'Hello World!',
        },
        {
          type: 'CUSTOM',
          label: 'Align',
          key: 'align',
          value: 'center',
          configuration: {
            as: 'BUTTONGROUP',
            dataType: 'string',
            allowedInput: [
              { name: 'Left', value: 'left' },
              { name: 'Center', value: 'center' },
              { name: 'Right', value: 'right' },
            ],
          },
        },
        {
          type: 'SIZES',
          label: 'Padding',
          key: 'padding',
          value: ['S', 'S', 'S', 'S'],
        },
        {
          type: 'COLOR',
          label: 'Color',
          key: 'color',
          value: 'Black',
        },
      ],
      descendants: [],
    },
  ],
}))();
