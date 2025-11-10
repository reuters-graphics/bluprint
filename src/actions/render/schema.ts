import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'render',
//   engine: 'mustache',
//   files: ['myfile.txt'],
//   questions: [],
//   context: {},
// }

export const renderSchema = v.object({
  action: v.literal('render'),
  condition: v.optional(conditionSchema),
  engine: v.picklist(['mustache', 'ejs']),
  files: v.pipe(v.array(v.string()), v.minLength(1)),
  questions: v.optional(v.pipe(v.array(v.any()), v.minLength(1))),
  context: v.optional(v.record(v.string(), v.any())),
  inject: v.optional(v.array(v.any())),
});

export type RenderAction = v.InferOutput<typeof renderSchema>;

export default renderSchema;
