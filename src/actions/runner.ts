import chalk from 'chalk-template';
import { log as clackLog } from '@clack/prompts';
import { getDefaultContext } from './context';
import type { Action, ActionContext } from './types';

/**
 * Run a list of actions in order against a scaffolded project.
 *
 * Each action is gated on its optional `when` predicate, then run. Anything an
 * action returns is merged into the context for subsequent actions. If an action
 * throws it's logged and skipped — the rest of the run continues — unless that
 * action set `failOnError`, in which case the error is re-thrown to abort the
 * run.
 *
 * @param actions The actions to run (from a bluprint's config).
 * @param bluprintPart The selected bluprint part, if any.
 * @returns The final context after all actions have run.
 * @throws The original error if a `failOnError` action throws.
 */
export const runActions = async (
  actions: Action[],
  bluprintPart?: string
): Promise<ActionContext> => {
  let context: ActionContext = getDefaultContext(bluprintPart);

  for (const action of actions) {
    if (action.when && !action.when(context)) continue;

    try {
      const result = await action.run(context);
      if (result) context = { ...context, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (action.failOnError) {
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
