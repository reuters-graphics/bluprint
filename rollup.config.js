import externals from 'rollup-plugin-node-externals';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const plugins = [json(), externals({ deps: true }), typescript()];

const output = {
  dir: 'dist',
  format: 'es',
  sourcemap: true,
  paths: { '@reuters-graphics/bluprint': './index.js' },
};

export default [
  {
    input: 'src/index.ts',
    output,
    plugins,
  },
  {
    input: 'src/cli.ts',
    output: { ...output, ...{ banner: '#!/usr/bin/env node' } },
    plugins,
    external: ['@reuters-graphics/bluprint'],
  },
];
