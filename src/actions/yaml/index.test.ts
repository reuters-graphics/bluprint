import mock from 'mock-fs';
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { yaml } from './index';
import type { ActionContext } from '../types';

const CWD = process.cwd();
const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});
const readYaml = (p: string) =>
  parse(fs.readFileSync(path.join(CWD, p), 'utf-8'));

describe('yaml action', () => {
  afterEach(() => mock.restore());

  it('edits a value and writes it back', async () => {
    mock({ 'ci.yml': 'name: old\non: push\n' });

    await yaml<{ name: string; on: string }>('ci.yml', (wf) => {
      wf.name = 'new';
      return wf;
    }).run(ctx());

    const wf = readYaml('ci.yml');
    expect(wf.name).toBe('new');
    expect(wf.on).toBe('push'); // untouched
  });

  it('changes a nested property', async () => {
    mock({ 'config.yml': 'build:\n  target: es2020\n  minify: false\n' });

    await yaml<{ build: { target: string; minify: boolean } }>(
      'config.yml',
      (cfg) => {
        cfg.build.target = 'es2022';
        return cfg;
      }
    ).run(ctx());

    const cfg = readYaml('config.yml');
    expect(cfg.build.target).toBe('es2022');
    expect(cfg.build.minify).toBe(false);
  });

  it('passes the run context to the editor', async () => {
    mock({ 'meta.yml': 'title: ""\n' });

    await yaml<{ title: string }>('meta.yml', (data, c) => {
      data.title = String(c.name);
      return data;
    }).run(ctx({ name: 'from-prompt' }));

    expect(readYaml('meta.yml').title).toBe('from-prompt');
  });

  it('supports async editors', async () => {
    mock({ 'f.yml': 'a: 1\n' });

    await yaml<{ a: number; b?: number }>('f.yml', async (d) => ({
      ...d,
      b: 2,
    })).run(ctx());

    expect(readYaml('f.yml')).toEqual({ a: 1, b: 2 });
  });
});
