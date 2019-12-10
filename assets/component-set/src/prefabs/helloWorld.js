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
          type: 'TEXT_FIELD',
        },
        {
          value: 'title2',
          label: 'Heading type',
          key: 'headingType',
          type: 'HEADING_TYPOGRAPHY',
        },
      ],
      descendants: [],
    },
  ],
}))();
