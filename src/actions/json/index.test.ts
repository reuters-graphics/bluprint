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

  it('writes back a mutated object (no return)', async () => {
    mock({ 'package.json': JSON.stringify({ name: 'old', version: '1.0.0' }) });

    await json('package.json', (pkg: any) => {
      pkg.name = 'new';
    }).run(ctx());

    const pkg = readJson('package.json');
    expect(pkg.name).toBe('new');
    expect(pkg.version).toBe('1.0.0'); // untouched
  });

  it('writes back a returned value (replace)', async () => {
    mock({ 'tsconfig.json': JSON.stringify({ a: 1 }) });

    await json('tsconfig.json', (cfg: any) => ({ ...cfg, b: 2 })).run(ctx());

    expect(readJson('tsconfig.json')).toEqual({ a: 1, b: 2 });
  });

  it('can change a single deep property', async () => {
    mock({
      'package.json': JSON.stringify({ scripts: { build: 'old', test: 'x' } }),
    });

    await json('package.json', (pkg: any) => {
      pkg.scripts.build = 'tsc';
    }).run(ctx());

    const pkg = readJson('package.json');
    expect(pkg.scripts.build).toBe('tsc');
    expect(pkg.scripts.test).toBe('x');
  });

  it('passes the run context to the editor', async () => {
    mock({ 'package.json': JSON.stringify({ name: '' }) });

    await json('package.json', (pkg: any, c) => {
      pkg.name = c.name;
    }).run(ctx({ name: 'from-prompt' }));

    expect(readJson('package.json').name).toBe('from-prompt');
  });

  it('pretty-prints with 2-space indentation and a trailing newline', async () => {
    mock({ 'f.json': '{"a":1}' });

    await json('f.json', (d: any) => {
      d.b = 2;
    }).run(ctx());

    const raw = fs.readFileSync(path.join(CWD, 'f.json'), 'utf-8');
    expect(raw).toBe('{\n  "a": 1,\n  "b": 2\n}\n');
  });

  it('supports async editors', async () => {
    mock({ 'f.json': '{}' });

    await json('f.json', async (d: any) => {
      d.async = true;
    }).run(ctx());

    expect(readJson('f.json')).toEqual({ async: true });
  });
});
