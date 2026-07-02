import { cancel, isCancel } from '@clack/prompts';
import { DateTimePrompt, type DateTimeOptions } from './DateTimePrompt';

/**
 * Prompt for a date and time. Returns the selected `Date` (seconds/ms zeroed),
 * or exits the process if the user cancels — matching the other prompt wrappers.
 */
export const datetime = async (options: DateTimeOptions): Promise<Date> => {
  const value = await new DateTimePrompt(options).prompt();

  if (isCancel(value)) {
    cancel('Cancelled');
    process.exit(0);
  }

  return value as Date;
};
