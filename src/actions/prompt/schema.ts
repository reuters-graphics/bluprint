import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'prompt',
//   questions: [],
// }

export const promptSchema = v.object({
  action: v.literal('prompt'),
  condition: v.optional(conditionSchema),
  questions: v.pipe(v.array(v.any()), v.minLength(1)),
});

export type PromptAction = v.InferOutput<typeof promptSchema>;

export default promptSchema;
