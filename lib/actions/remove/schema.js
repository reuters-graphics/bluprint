import conditionSchema from '../common/condition';
// {
//   action: 'remove',
//   paths: ['dir/*'],
// }

export default {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'remove',
    },
    condition: conditionSchema,
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
