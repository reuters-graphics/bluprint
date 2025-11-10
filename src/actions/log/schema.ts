import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'log',
//   msg: 'Hello {green {{name}}} you.',
// }

export const logSchema = v.object({
  action: v.literal('log'),
  condition: v.optional(conditionSchema),
  msg: v.string(),
});

export type LogAction = v.InferOutput<typeof logSchema>;

export default logSchema;
