import type { Action } from '../actions/types';

type BluprintPart = {
  title?: string;
  hint?: string;
  files: string | string[];
  ignores: string | string[];
  actions?: Action[];
};

export type BluprintConfig = {
  name:
    | string
    | {
        title: string;
        hint?: string;
      };
  category?: string;
  bluprint?: string;
  files: string | string[];
  ignores: string | string[];
  actions?: Action[];
  parts?: Record<string, BluprintPart>;
};
