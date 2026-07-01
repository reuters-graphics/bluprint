import * as prompts from '../../prompts';
import type { Action, ActionOptions } from '../types';

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
export const prompt = (
  spec: PromptSpec,
  options: ActionOptions = {}
): Action => ({
  name: 'prompt',
  when: options.when,
  run: async () => {
    const answer = await ask(spec);
    return { [spec.name]: answer };
  },
});
