// {
//   action: 'execute',
//   cmds: [
//     ['echo', ['cat']],
//   ],
// }
// ... or ...
// {
//   action: 'execute',
//   cmds: [
//     ['yarn'],
//   ],
// }

module.exports = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'execute',
    },
    cmds: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'array',
        minItems: 1,
        items: [
          { type: 'string' },
        ],
        additionalItems: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  },
  required: ['action', 'cmds'],
};
