import conditionSchema from '../common/condition';
// {
//   action: 'render',
//   engine: 'mustache',
//   files: ['myfile.txt'],
//   questions: [],
//   context: {},
// }

export default {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'render',
    },
    condition: conditionSchema,
    engine: {
      type: 'string',
      enum: ['mustache', 'ejs'],
    },
    files: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
    questions: {
      type: 'array',
      minItems: 1,
    },
    context: {
      type: 'object',
      minProperties: 1,
    },
  },
  required: ['action', 'engine', 'files'],
};
