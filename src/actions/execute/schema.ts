import * as v from 'valibot';
import conditionSchema from '../common/condition.js';

// {
//   action: 'execute',
//   cmds: [
//     ['echo', ['cat']],
//   ],
// }
// ... or ...
// {
//   action: 'execute',
//   cmds: [
//     ['yarn'],
//   ],
//   silent: true,
// }

// Command is [cmdString, [args], ...]
const commandSchema = v.pipe(
  v.array(v.union([v.string(), v.array(v.string())])),
  v.minLength(1)
);

export const executeSchema = v.object({
  action: v.literal('execute'),
  condition: v.optional(conditionSchema),
  cmds: v.pipe(v.array(commandSchema), v.minLength(1)),
  silent: v.optional(v.boolean()),
});

export type ExecuteAction = v.InferOutput<typeof executeSchema>;

export default executeSchema;
