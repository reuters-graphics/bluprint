import * as v from 'valibot';
import actionsSchema from './actions/schema.js';

export const bluprintrcSchema = v.object({
  bluprint: v.string(),
  name: v.string(),
  category: v.string(),
  actions: actionsSchema,
  parts: v.optional(
    v.record(
      v.string(),
      v.pipe(v.array(v.string()), v.minLength(1))
    )
  ),
  mergeJson: v.optional(v.boolean()),
});

export type Bluprintrc = v.InferOutput<typeof bluprintrcSchema>;

export default bluprintrcSchema;
