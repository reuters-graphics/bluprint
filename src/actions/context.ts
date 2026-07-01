import path from 'node:path';
import type { DefaultContext } from './types';

/**
 * Build the default context available to every action: some date parts and the
 * basename of the current working directory.
 *
 * @param bluprintPart The selected bluprint part, if any.
 */
export const getDefaultContext = (bluprintPart?: string): DefaultContext => {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dirname = process.cwd().split(path.sep).slice(-1)[0];

  return { year, month, day, dirname, bluprintPart };
};
