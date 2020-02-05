import conditionSchema from '../common/condition';
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
    condition: conditionSchema,
    questions: {
      type: 'array',
      minItems: 1,
    },
  },
  required: ['action', 'questions'],
};
