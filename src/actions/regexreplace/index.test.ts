import mock from 'mock-fs';
import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { regexreplace } from './index';
import type { ActionContext } from '../types';

vi.mock('@clack/prompts', () => ({
  log: { warn: vi.fn(), success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

const CWD = process.cwd();
const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});
const read = (p: string) => fs.readFileSync(path.join(CWD, p), 'utf-8');

describe('regexreplace action', () => {
  afterEach(() => mock.restore());

  it('replaces with a single replacement, rendering the replacement string', async () => {
    mock({ 'README.md': '# Old Title' });

    await regexreplace({
      files: 'README.md',
      replace: ['^# .*$', '# {{title}}'],
    }).run(ctx({ title: 'New' }));

    expect(read('README.md')).toBe('# New');
  });

  it('applies multiple replacements in order', async () => {
    mock({ 'f.txt': 'foo bar' });

    await regexreplace({
      files: 'f.txt',
      replace: [
        ['foo', 'baz'],
        ['bar', 'qux'],
      ],
    }).run(ctx());

    expect(read('f.txt')).toBe('baz qux');
  });

  it('honors custom flags', async () => {
    mock({ 'f.txt': 'a A a' });

    await regexreplace({
      files: 'f.txt',
      replace: ['a', 'X', 'gi'],
    }).run(ctx());

    expect(read('f.txt')).toBe('X X X');
  });

  it('skips (does not throw) when a file is missing', async () => {
    mock({});
    await regexreplace({ files: 'nope.txt', replace: ['a', 'b'] }).run(ctx());
    // no throw = pass
  });
});
