// {
//   action: 'prompt',
//   questions: [],
// }

export default {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'prompt',
    },
    questions: {
      type: 'array',
      minItems: 1,
    },
  },
  required: ['action', 'questions'],
};
