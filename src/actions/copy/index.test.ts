import mock from 'mock-fs';
import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { copy } from './index';
import type { ActionContext } from '../types';

vi.mock('@clack/prompts', () => ({
  log: { warn: vi.fn(), success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// mock-fs resolves relative keys against process.cwd(), which is where the
// actions operate. Keying by the absolute cwd path collides with mock-fs's own
// cwd node, so we use relative keys.
const CWD = process.cwd();
const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});

const read = (p: string) => fs.readFileSync(path.join(CWD, p), 'utf-8');
const exists = (p: string) => fs.existsSync(path.join(CWD, p));

describe('copy action', () => {
  afterEach(() => mock.restore());

  it('copies a file, rendering the destination path', async () => {
    mock({ tpl: { 'readme.md': '# hi' } });

    await copy(['tpl/readme.md', 'out/{{name}}.md']).run(ctx({ name: 'proj' }));

    expect(read('out/proj.md')).toBe('# hi');
    expect(read('tpl/readme.md')).toBe('# hi'); // original still there
  });

  it('copies a directory recursively', async () => {
    mock({ src: { 'a.txt': 'A', nested: { 'b.txt': 'B' } } });

    await copy(['src', 'dest']).run(ctx());

    expect(read('dest/a.txt')).toBe('A');
    expect(read('dest/nested/b.txt')).toBe('B');
  });

  it('accepts multiple pairs', async () => {
    mock({ 'a.txt': 'A', 'b.txt': 'B' });

    await copy([
      ['a.txt', 'x/a.txt'],
      ['b.txt', 'x/b.txt'],
    ]).run(ctx());

    expect(read('x/a.txt')).toBe('A');
    expect(read('x/b.txt')).toBe('B');
  });

  it('skips (does not throw) when the source is missing', async () => {
    mock({});

    await copy(['nope.txt', 'out.txt']).run(ctx());

    expect(exists('out.txt')).toBe(false);
  });

  it('exposes its name, when, and failOnError options', () => {
    const when = () => false;
    const action = copy(['a', 'b'], { when, failOnError: true });
    expect(action.name).toBe('copy');
    expect(action.when).toBe(when);
    expect(action.failOnError).toBe(true);
  });
});
