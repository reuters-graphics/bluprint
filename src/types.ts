export interface UserConfig {
  version: string;
  bluprints: Record<string, any>;
  token?: string;
}

// Re-export Bluprintrc from schema
export type { Bluprintrc } from './schema.js';
