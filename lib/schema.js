const actionsSchema = require('./actions/schema');

module.exports = {
  type: 'object',
  properties: {
    bluprint: { type: 'string' },
    name: { type: 'string' },
    category: { type: 'string' },
    actions: actionsSchema,
  },
  required: ['bluprint', 'name', 'category', 'actions'],
};
