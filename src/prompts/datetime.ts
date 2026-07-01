import { isCancel, cancel } from '@clack/prompts';
import { datetime as datetimePrompt } from '@reuters-graphics/clack';

interface DatetimeOptions {
  /**
   * A message to prompt the user to enter the value.
   */
  message: string;
  /**
   * Initial value of the prompt.
   */
  initialValue?: Date;
  /**
   * Validator passed to user prompt.
   *
   * If the value is invalid, return a message that describes
   * what's wrong to the user.
   *
   * @example
   * ```typescript
   * {
   *   validate: (value: Date) => {
   *     if (value < new Date()) {
   *       return 'Date must be in the future';
   *     }
   *   }
   * }
   * ```
   *
   * @param value value from prompt
   * @returns Message or Error if value is invalid
   */
  validate?: (value: Date) => string | Error | undefined;
}

/**
 * Prompt for a datetime value
 */

export const datetime = async ({
  message,
  initialValue,
  validate,
}: DatetimeOptions) => {
  const value = await datetimePrompt({
    message,
    initialValue,
    validate,
  });

  if (isCancel(value)) {
    cancel('Cancelled');
    process.exit(0);
  }
  return value;
};
