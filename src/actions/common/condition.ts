import * as v from 'valibot';

// Condition can be a single condition tuple or array of condition tuples
// Each tuple is [key, value] where value can be string, number, boolean, or null
export const conditionValueSchema = v.union([
  v.string(),
  v.number(),
  v.boolean(),
  v.null_(),
]);

export const conditionTupleSchema = v.tuple([
  v.string(),
  conditionValueSchema,
]);

export const conditionSchema = v.union([
  conditionTupleSchema,
  v.array(conditionTupleSchema),
]);

export type ConditionValue = v.InferOutput<typeof conditionValueSchema>;
export type ConditionTuple = v.InferOutput<typeof conditionTupleSchema>;
export type Condition = v.InferOutput<typeof conditionSchema>;

export default conditionSchema;
