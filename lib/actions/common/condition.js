export default {
  oneOf: [
    {
      type: 'array',
      items: {
        type: 'array',
        items: [
          { type: 'string' },
          { oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
            { type: 'null' },
          ] },
        ],
      },
    },
    {
      type: 'array',
      items: [
        { type: 'string' },
        { oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
          { type: 'null' },
        ] },
      ],
    },
  ],
};
