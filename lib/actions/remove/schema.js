// {
//   action: 'remove',
//   paths: ['dir/*'],
// }

module.exports = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'remove',
    },
    paths: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
  },
  required: ['action', 'paths'],
};
