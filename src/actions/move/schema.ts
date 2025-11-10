import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'move',
//   paths: ['from/', 'to/'],
// }
// ... or ...
// {
//   action: 'move',
//   paths: [
//      ['from/', 'to/'],
//      ['from', 'to'],
//   ],
// }

export const moveSchema = v.object({
  action: v.literal('move'),
  condition: v.optional(conditionSchema),
  paths: v.union([
    v.array(v.tuple([v.string(), v.string()])),
    v.tuple([v.string(), v.string()]),
  ]),
});

export type MoveAction = v.InferOutput<typeof moveSchema>;

export default moveSchema;
