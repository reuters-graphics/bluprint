import { text as textPrompt, isCancel, cancel } from '@clack/prompts';

interface TextOptions {
  /**
   * A message to prompt the user to enter the value.
   */
  message: string;
  /**
   * Initial value of the prompt.
   */
  initialValue?: string;
  placeholder?: string;
  /**
   * Validator passed to user prompt.
   *
   * If the value is invalid, return a message that describes
   * what's wrong to the user.
   *
   * @example
   * ```typescript
   * {
   *   validate: (value: string) => {
   *     if (value.length < 3) {
   *       return 'Value should be longer than 3 character';
   *     }
   *   }
   * }
   * ```
   *
   * @param value value from prompt
   * @returns Message or Error if value is invalid
   */
  validate?: (value: string) => string | Error | undefined;
}

/**
 * Prompt for a text value
 */

export const text = async ({
  message,
  initialValue,
  placeholder,
  validate,
}: TextOptions) => {
  const value = await textPrompt({
    message,
    initialValue,
    placeholder,
    validate,
  });

  if (isCancel(value)) {
    cancel('Cancelled');
    process.exit(0);
  }
  return value;
};
