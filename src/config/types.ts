type BluprintPart = {
  title?: string;
  hint?: string;
  files: string | string[];
  ignores: string | string[];
  actions?: [];
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
  actions?: [];
  parts?: Record<string, BluprintPart>;
};
