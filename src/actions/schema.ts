import * as v from 'valibot';
import copySchema from './copy/schema.js';
import executeSchema from './execute/schema.js';
import logSchema from './log/schema.js';
import moveSchema from './move/schema.js';
import promptSchema from './prompt/schema.js';
import regexreplaceSchema from './regexreplace/schema.js';
import removeSchema from './remove/schema.js';
import renderSchema from './render/schema.js';

export const actionsSchema = v.array(
  v.union([
    executeSchema,
    copySchema,
    logSchema,
    moveSchema,
    promptSchema,
    removeSchema,
    renderSchema,
    regexreplaceSchema,
  ])
);

export type Actions = v.InferOutput<typeof actionsSchema>;

export default actionsSchema;
