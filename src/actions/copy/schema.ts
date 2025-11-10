import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'copy',
//   paths: ['from/', 'to/'],
// }
// ... or ...
// {
//   action: 'copy',
//   paths: [
//      ['from/', 'to/'],
//      ['from', 'to'],
//   ],
// }

export const copySchema = v.object({
  action: v.literal('copy'),
  condition: v.optional(conditionSchema),
  paths: v.union([
    v.array(v.tuple([v.string(), v.string()])),
    v.tuple([v.string(), v.string()]),
  ]),
});

export type CopyAction = v.InferOutput<typeof copySchema>;

export default copySchema;
