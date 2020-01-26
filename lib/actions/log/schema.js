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
    msg: {
      type: 'string',
    },
  },
  required: ['action', 'msg'],
};
