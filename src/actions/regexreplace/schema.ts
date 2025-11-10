import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'regexreplace',
//   files: ['myFile.js'],
//   replace: ['^abc', 'def'],
// }
// ... or ...
// {
//   action: 'regexreplace',
//   files: ['myFile.js'],
//   replace: [
//     ['^abc', 'def'],
//     ['xyz$', 'abc', 'gi'],
//   ],
// }

// Replace tuple is [pattern, replacement] or [pattern, replacement, flags]
const replaceTupleSchema = v.union([
  v.tuple([v.string(), v.string()]),
  v.tuple([v.string(), v.string(), v.string()]),
]);

export const regexreplaceSchema = v.object({
  action: v.literal('regexreplace'),
  condition: v.optional(conditionSchema),
  files: v.pipe(v.array(v.string()), v.minLength(1)),
  replace: v.union([
    replaceTupleSchema,
    v.array(replaceTupleSchema),
  ]),
});

export type RegexReplaceAction = v.InferOutput<typeof regexreplaceSchema>;

export default regexreplaceSchema;
