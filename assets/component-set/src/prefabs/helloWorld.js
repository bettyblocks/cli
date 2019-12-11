(() => ({
  name: 'Hello world',
  icon: 'TitleIcon',
  category: 'CONTENT',
  structure: [
    {
      name: 'HelloWorld',
      options: [
        {
          value: '',
          label: 'Content',
          key: 'content',
          type: 'TEXT',
        },
        {
          value: 'title2',
          label: 'Heading type',
          key: 'headingType',
          type: 'CUSTOM',
          configuration: {
            as: 'BUTTONGROUP',
            dataType: 'string',
            allowedInput: [
              {
                name: '1',
                value: 'title1',
              },
              {
                name: '2',
                value: 'title2',
              },
              {
                name: '3',
                value: 'title3',
              },
              {
                name: '4',
                value: 'title4',
              },
            ],
          },
        },
      ],
      descendants: [],
    },
  ],
}))();
