import type {
  Action,
  ActionContext,
  ActionOptions,
  Awaitable,
  DefaultContext,
} from '../types';

/**
 * Run an arbitrary function as an action — the escape hatch for logic no
 * built-in action covers. The function receives the run context (including
 * answers from earlier `prompt` actions) and may return a partial context to
 * merge in for later actions.
 *
 * @example
 * run(async (ctx) => {
 *   const res = await fetch(`https://api.example.com/${ctx.name}`);
 *   return { id: (await res.json()).id }; // available to later actions
 * })
 */
export const run = <
  Ctx extends DefaultContext = ActionContext,
  R extends Partial<Ctx> = Partial<Ctx>,
>(
  fn: (ctx: Ctx) => Awaitable<void | R>,
  options: ActionOptions<Ctx> = {}
): Action<Ctx> => ({
  name: 'run',
  when: options.when,
  failOnError: options.failOnError,
  run: fn,
});
