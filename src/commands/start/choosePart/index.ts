import chalk from 'chalk-template';
import { log } from '@clack/prompts';
import * as prompts from '../../../prompts';
import { runtime } from '../../../runtime';
import type { BluprintConfig } from '../../../config/types';
import type { Action } from '../../../actions/types';

export interface PartSelection {
  /** Chosen part key, or `null` for the whole bluprint. */
  part: string | null;
  files: string | string[];
  ignores: string | string[];
  actions: Action[];
}

/** Resolve a named part into a selection, or throw if the key is unknown. */
const selectPart = (config: BluprintConfig, key: string): PartSelection => {
  const part = config.parts?.[key];
  if (!part) {
    throw new Error(
      `Unknown part "${key}". Available: ${Object.keys(config.parts ?? {}).join(', ') || '(none)'}`
    );
  }
  return {
    part: key,
    files: part.files,
    ignores: part.ignores,
    actions: part.actions ?? config.actions ?? [],
  };
};

/**
 * Resolve which files and actions a `start` run should use. If the bluprint
 * defines parts, the user is asked whether to use one; choosing a part uses
 * that part's `files`/`ignores` and its `actions` (falling back to the
 * top-level actions if the part defines none). Otherwise the top-level
 * `files`/`ignores`/`actions` are used.
 *
 * @param config The bluprint config.
 * @param requestedPart A part key chosen up front (e.g. `start --part`). Skips
 *   the interactive picker.
 */
export const choosePart = async (
  config: BluprintConfig,
  requestedPart?: string
): Promise<PartSelection> => {
  const whole: PartSelection = {
    part: null,
    files: config.files,
    ignores: config.ignores,
    actions: config.actions ?? [],
  };

  // An explicit `--part` wins in any mode.
  if (requestedPart) return selectPart(config, requestedPart);

  const { parts } = config;
  if (!parts || Object.keys(parts).length === 0) return whole;

  // Non-interactive: can't ask, so scaffold the whole bluprint.
  if (!runtime.interactive) {
    log.info(
      chalk`This bluprint has parts; scaffolding the whole thing. Pass {yellow --part} to pick one.`
    );
    return whole;
  }

  const usePart = await prompts.confirm({
    message:
      'This bluprint has parts. Use just one part instead of the whole thing?',
    initialValue: false,
  });
  if (!usePart) return whole;

  const key = await prompts.select({
    message: 'Which part would you like to use?',
    options: Object.entries(parts).map(([value, part]) => ({
      value,
      label: part.title ?? value,
      hint: part.hint,
    })),
  });

  return selectPart(config, key);
};
