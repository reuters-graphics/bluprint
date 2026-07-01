import * as prompts from '../../../prompts';
import type { BluprintConfig } from '../../../config/types';
import type { Action } from '../../../actions/types';

export interface PartSelection {
  /** Chosen part key, or `null` for the whole bluprint. */
  part: string | null;
  files: string | string[];
  ignores: string | string[];
  actions: Action[];
}

/**
 * Resolve which files and actions a `start` run should use. If the bluprint
 * defines parts, the user is asked whether to use one; choosing a part uses
 * that part's `files`/`ignores` and its `actions` (falling back to the
 * top-level actions if the part defines none). Otherwise the top-level
 * `files`/`ignores`/`actions` are used.
 */
export const choosePart = async (
  config: BluprintConfig
): Promise<PartSelection> => {
  const whole: PartSelection = {
    part: null,
    files: config.files,
    ignores: config.ignores,
    actions: config.actions ?? [],
  };

  const { parts } = config;
  if (!parts || Object.keys(parts).length === 0) return whole;

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

  const part = parts[key];
  return {
    part: key,
    files: part.files,
    ignores: part.ignores,
    actions: part.actions ?? config.actions ?? [],
  };
};
