/**
 * This file is an example config module for temporary reference...
 */

import type { BluprintConfig } from './types';

const defineConfig = (obj: BluprintConfig) => obj;

export default defineConfig({
  name: {
    title: 'Graphics kit',
    hint: 'Rig for most of graphics kits',
  },
  category: 'Graphics rigs',
  bluprint: '^1.0.0',
  files: ['**/*'],
  ignores: [],
  actions: [
    /* ... */
  ],
  parts: {
    config: {
      title: 'Config files',
      hint: '',
      files: ['**/*'],
      ignores: [],
      actions: [
        /* ... */
      ],
    },
  },
});
