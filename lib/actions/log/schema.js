// {
//   action: 'log',
//   msg: 'Hello {green {{name}}} you.',
// }

module.exports = {
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
