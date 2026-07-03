import * as prompts from '../../prompts';
import { runtime } from '../../runtime';
import type {
  Action,
  ActionContext,
  ActionOptions,
  DefaultContext,
} from '../types';

interface SelectOption {
  value: string;
  label?: string;
  hint?: string;
}

interface BasePrompt {
  /** Key under which the answer is stored in the run context. */
  name: string;
  /** Message shown to the user. */
  message: string;
}

/** A prompt spec, discriminated on `type`. */
export type PromptSpec =
  | (BasePrompt & {
      type: 'text';
      placeholder?: string;
      initialValue?: string;
      validate?: (value: string) => string | Error | undefined;
    })
  | (BasePrompt & { type: 'confirm'; initialValue?: boolean })
  | (BasePrompt & {
      type: 'select';
      options: SelectOption[];
      initialValue?: string;
    })
  | (BasePrompt & {
      type: 'multiselect';
      options: SelectOption[];
      initialValues?: string[];
      required?: boolean;
      maxItems?: number;
    })
  | (BasePrompt & { type: 'datetime'; initialValue?: Date });

const ask = (spec: PromptSpec) => {
  switch (spec.type) {
    case 'text':
      return prompts.text(spec);
    case 'confirm':
      return prompts.confirm(spec);
    case 'select':
      return prompts.select(spec);
    case 'multiselect':
      return prompts.multiselect(spec);
    case 'datetime':
      return prompts.datetime(spec);
  }
};

/**
 * Ask the user a question and store the answer in the run context under
 * `spec.name`, where later actions (and their `when` gates) can read it.
 *
 * @example prompt({ name: 'name', type: 'text', message: 'Project name?' })
 * @example prompt({ name: 'ts', type: 'confirm', message: 'Use TypeScript?' })
 */
export const prompt = <Ctx extends DefaultContext = ActionContext>(
  spec: PromptSpec,
  options: ActionOptions<Ctx> = {}
): Action<Ctx> => ({
  name: 'prompt',
  when: options.when,
  failOnError: options.failOnError,
  run: async (ctx) => {
    // A value supplied ahead of time (e.g. via `--input`) wins — keep it, don't
    // prompt. It's already in the context, so return nothing to merge.
    if (spec.name in ctx) return {};

    // Non-interactive (CI): can't ask. Fall back to the spec's default if it has
    // one, otherwise fail loudly so the run doesn't silently scaffold a blank.
    if (!runtime.interactive) {
      const fallback =
        spec.type === 'multiselect' ? spec.initialValues : spec.initialValue;
      if (fallback === undefined) {
        throw new Error(
          `Missing required input "${spec.name}" in non-interactive mode. ` +
            `Provide it with --input.`
        );
      }
      return { [spec.name]: fallback } as Partial<Ctx>;
    }

    const answer = await ask(spec);
    // The answer is stored under a dynamic key (`spec.name`); a typed config is
    // expected to declare it on its context (see `defineConfig`).
    return { [spec.name]: answer } as Partial<Ctx>;
  },
});
