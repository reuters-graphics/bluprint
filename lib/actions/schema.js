import executeSchema from './execute/schema';
import logSchema from './log/schema';
import moveSchema from './move/schema';
import promptSchema from './prompt/schema';
import regexreplaceSchema from './regexreplace/schema';
import removeSchema from './remove/schema';
import renderSchema from './render/schema';

export default {
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
      regexreplaceSchema,
    ],
  },
};
