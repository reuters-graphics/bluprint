import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'remove',
//   paths: ['dir/*'],
// }

export const removeSchema = v.object({
  action: v.literal('remove'),
  condition: v.optional(conditionSchema),
  paths: v.pipe(v.array(v.string()), v.minLength(1)),
});

export type RemoveAction = v.InferOutput<typeof removeSchema>;

export default removeSchema;
