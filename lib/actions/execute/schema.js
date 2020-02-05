import conditionSchema from '../common/condition';
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
//   silent: true,
// }

export default {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'execute',
    },
    condition: conditionSchema,
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
    silent: { type: 'boolean' },
  },
  required: ['action', 'cmds'],
};
