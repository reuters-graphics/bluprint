const executeSchema = require('./execute/schema');
const logSchema = require('./log/schema');
const moveSchema = require('./move/schema');
const promptSchema = require('./prompt/schema');
const removeSchema = require('./remove/schema');
const renderSchema = require('./render/schema');

module.exports = {
  type: 'array',
  items: {
    type: 'object',
    oneOf: [
      executeSchema,
      logSchema,
      moveSchema,
      promptSchema,
      removeSchema,
      renderSchema,
    ],
  },
};
