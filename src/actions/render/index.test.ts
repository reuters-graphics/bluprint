import mock from 'mock-fs';
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { render } from './index';
import type { ActionContext } from '../types';

const CWD = process.cwd();
const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});
const read = (p: string) => fs.readFileSync(path.join(CWD, p), 'utf-8');

describe('render action', () => {
  afterEach(() => mock.restore());

  it('renders a mustache file in place (default engine)', async () => {
    mock({ 'README.md': '# {{title}}' });

    await render({ files: 'README.md' }).run(ctx({ title: 'Hello' }));

    expect(read('README.md')).toBe('# Hello');
  });

  it('renders with EJS when engine is ejs', async () => {
    mock({ 'f.txt': 'Hi <%= name %>' });

    await render({ files: ['f.txt'], engine: 'ejs' }).run(ctx({ name: 'Sam' }));

    expect(read('f.txt')).toBe('Hi Sam');
  });

  it('merges the action-local context over the run context', async () => {
    mock({ 'f.txt': '{{a}}-{{b}}' });

    await render({ files: 'f.txt', context: { b: 'local' } }).run(
      ctx({ a: 'run', b: 'run' })
    );

    expect(read('f.txt')).toBe('run-local');
  });

  it('exposes mustache helpers (e.g. slugify)', async () => {
    mock({ 'f.txt': '{{#slugify}}{{title}}{{/slugify}}' });

    await render({ files: 'f.txt' }).run(ctx({ title: 'Hello World' }));

    expect(read('f.txt')).toBe('hello-world');
  });
});
