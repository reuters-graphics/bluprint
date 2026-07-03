import chalk from 'chalk-template';
import { log as clackLog } from '@clack/prompts';
import { getDefaultContext } from './context';
import type { Action, ActionContext } from './types';

export interface RunActionsOptions {
  /** The selected bluprint part, if any. */
  bluprintPart?: string;
  /**
   * Values to seed the run context with before any action runs — e.g. answers
   * supplied via `--input` so `prompt` actions can resolve them instead of asking.
   */
  values?: Record<string, unknown>;
  /**
   * Abort the whole run as soon as any action throws, regardless of the action's
   * own `failOnError`. Used in non-interactive runs so failures never pass
   * silently in CI.
   */
  failFast?: boolean;
}

/**
 * Run a list of actions in order against a scaffolded project.
 *
 * Each action is gated on its optional `when` predicate, then run. Anything an
 * action returns is merged into the context for subsequent actions. If an action
 * throws it's logged and skipped — the rest of the run continues — unless that
 * action set `failOnError` (or `failFast` is on), in which case the error is
 * re-thrown to abort the run.
 *
 * @param actions The actions to run (from a bluprint's config).
 * @param options Part selection, seed values, and fail-fast behavior.
 * @returns The final context after all actions have run.
 * @throws The original error if an action throws under `failOnError`/`failFast`.
 */
export const runActions = async (
  actions: Action[],
  { bluprintPart, values, failFast }: RunActionsOptions = {}
): Promise<ActionContext> => {
  let context: ActionContext = {
    ...getDefaultContext(bluprintPart),
    ...values,
  };

  for (const action of actions) {
    if (action.when && !action.when(context)) continue;

    try {
      const result = await action.run(context);
      if (result) context = { ...context, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (action.failOnError || failFast) {
        clackLog.error(
          chalk`{red.underline ${action.name}} action failed:\n${message}`
        );
        throw error;
      }
      clackLog.warn(
        chalk`Skipping {green.underline ${action.name}} action:\n${message}`
      );
    }
  }

  return context;
};
