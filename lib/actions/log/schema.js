import conditionSchema from '../common/condition';
// {
//   action: 'log',
//   msg: 'Hello {green {{name}}} you.',
// }

export default {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'log',
    },
    condition: conditionSchema,
    msg: {
      type: 'string',
    },
  },
  required: ['action', 'msg'],
};
