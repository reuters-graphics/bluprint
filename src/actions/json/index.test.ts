import mock from 'mock-fs';
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { json } from './index';
import type { ActionContext } from '../types';

const CWD = process.cwd();
const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});
const readJson = (p: string) =>
  JSON.parse(fs.readFileSync(path.join(CWD, p), 'utf-8'));

describe('json action', () => {
  afterEach(() => mock.restore());

  it('writes back a mutated-then-returned object', async () => {
    mock({ 'package.json': JSON.stringify({ name: 'old', version: '1.0.0' }) });

    await json<{ name: string; version: string }>('package.json', (pkg) => {
      pkg.name = 'new';
      return pkg;
    }).run(ctx());

    const pkg = readJson('package.json');
    expect(pkg.name).toBe('new');
    expect(pkg.version).toBe('1.0.0'); // untouched
  });

  it('writes back a fresh returned value (replace)', async () => {
    mock({ 'tsconfig.json': JSON.stringify({ a: 1 }) });

    await json<{ a: number; b?: number }>('tsconfig.json', (cfg) => ({
      ...cfg,
      b: 2,
    })).run(ctx());

    expect(readJson('tsconfig.json')).toEqual({ a: 1, b: 2 });
  });

  it('can change a single deep property', async () => {
    mock({
      'package.json': JSON.stringify({ scripts: { build: 'old', test: 'x' } }),
    });

    await json<{ scripts: Record<string, string> }>('package.json', (pkg) => {
      pkg.scripts.build = 'tsc';
      return pkg;
    }).run(ctx());

    const pkg = readJson('package.json');
    expect(pkg.scripts.build).toBe('tsc');
    expect(pkg.scripts.test).toBe('x');
  });

  it('passes the run context to the editor', async () => {
    mock({ 'package.json': JSON.stringify({ name: '' }) });

    await json<{ name: string }>('package.json', (pkg, c) => {
      pkg.name = String(c.name);
      return pkg;
    }).run(ctx({ name: 'from-prompt' }));

    expect(readJson('package.json').name).toBe('from-prompt');
  });

  it('pretty-prints with 2-space indentation and a trailing newline', async () => {
    mock({ 'f.json': '{"a":1}' });

    await json<{ a: number; b?: number }>('f.json', (d) => ({
      ...d,
      b: 2,
    })).run(ctx());

    const raw = fs.readFileSync(path.join(CWD, 'f.json'), 'utf-8');
    expect(raw).toBe('{\n  "a": 1,\n  "b": 2\n}\n');
  });

  it('supports async editors', async () => {
    mock({ 'f.json': '{}' });

    await json<{ async?: boolean }>('f.json', async (d) => ({
      ...d,
      async: true,
    })).run(ctx());

    expect(readJson('f.json')).toEqual({ async: true });
  });
});
