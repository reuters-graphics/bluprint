import { describe, it, expect } from 'vitest';
import { defineConfig } from './index';
import { prompt, render, run, json, execute } from '../actions';

/**
 * Type-level regression test for `defineConfig<Extra>` context threading
 * (the "Tier 1" typed context). The assertions live in the module body and are
 * enforced by `tsc` — the explicit `: string` / `: number` annotations fail to
 * compile if inference stops flowing, and the `@ts-expect-error` lines fail to
 * compile if the type system stops catching those mistakes. The runtime `it`
 * just keeps this file in the vitest suite.
 */
interface Ctx {
  projectName: string;
  count: number;
}

const config = defineConfig<Ctx>({
  name: 'Typed',
  files: ['**/*'],
  ignores: [],
  actions: [
    prompt({ name: 'projectName', type: 'text', message: 'Name?' }),

    // Declared context keys are typed (not `unknown`) in un-annotated closures…
    render({
      files: ['README.md'],
      when: (ctx) => {
        const name: string = ctx.projectName;
        const year: string = ctx.year; // …and DefaultContext survives.
        return name.length > 0 && year !== '';
      },
    }),

    run((ctx) => {
      const n: number = ctx.count;
      return { count: n + 1 }; // returning a declared key is fine
    }),

    // The editor's context is threaded too. In a typed config, annotate the
    // data param (rather than passing `json<T>`, which would switch off `Ctx`
    // inference) so both the data and `ctx` are typed.
    json('package.json', (pkg: { version: string }, ctx) => {
      pkg.version = ctx.projectName;
      return pkg;
    }),

    execute('pnpm install', { when: (ctx) => ctx.count > 0 }),

    // @ts-expect-error a context key not declared on Ctx is rejected
    run(() => ({ undeclared: true })),

    // @ts-expect-error a declared key used at the wrong type is caught
    render({ files: ['x'], when: (ctx) => ctx.projectName }),

    // @ts-expect-error a typo'd context key is caught
    render({ files: ['y'], when: (ctx) => ctx.proejctName === '' }),
  ],
});

describe('defineConfig typed context', () => {
  it('returns the config unchanged (types enforced at compile time)', () => {
    expect(config.actions).toHaveLength(8);
  });
});
