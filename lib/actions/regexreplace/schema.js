import conditionSchema from '../common/condition';
// {
//   action: 'regexreplace',
//   files: ['myFile.js'],
//   replace: ['^abc', 'def'],
// }
// ... or ...
// {
//   action: 'regexreplace',
//   files: ['myFile.js'],
//   replace: [
//     ['^abc', 'def'],
//     ['xyz$', 'abc', 'gi'],
//   ],
// }

export default {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      const: 'regexreplace',
    },
    condition: conditionSchema,
    files: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
    replace: {
      oneOf: [{
        type: 'array',
        items: {
          type: 'array',
          items: {
            type: 'string',
          },
          minItems: 2,
          maxItems: 3,
        },
      }, {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 2,
        maxItems: 3,
      }],
    },
  },
  required: ['action', 'files', 'replace'],
};
