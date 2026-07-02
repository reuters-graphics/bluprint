import type { Action, ActionContext, DefaultContext } from '../actions/types';

type BluprintPart<Ctx extends DefaultContext = ActionContext> = {
  title?: string;
  hint?: string;
  files: string | string[];
  ignores: string | string[];
  actions?: Action<Ctx>[];
};

export type BluprintConfig<Ctx extends DefaultContext = ActionContext> = {
  name:
    | string
    | {
        title: string;
        hint?: string;
      };
  bluprint?: string;
  files: string | string[];
  ignores: string | string[];
  actions?: Action<Ctx>[];
  parts?: Record<string, BluprintPart<Ctx>>;
};
