// {
//   action: 'move',
//   paths: ['from/', 'to/'],
// }
// ... or ...
// {
//   action: 'move',
//   paths: [
//      ['from/', 'to/'],
//      ['from', 'to'],
//   ],
// }

module.exports = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'move',
    },
    paths: {
      oneOf: [{
        type: 'array',
        items: {
          type: 'array',
          items: {
            type: 'string',
          },
          minItems: 2,
          maxItems: 2,
        },
      }, {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 2,
        maxItems: 2,
      }],
    },
  },
  required: ['action', 'paths'],
};
