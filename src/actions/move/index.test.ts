import mock from 'mock-fs';
import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { move } from './index';
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

const exists = (p: string) => fs.existsSync(path.join(CWD, p));
const read = (p: string) => fs.readFileSync(path.join(CWD, p), 'utf-8');

describe('move action', () => {
  afterEach(() => mock.restore());

  it('moves a file, rendering the destination path', async () => {
    mock({ 'index.ts': 'export {}' });

    await move(['index.ts', 'src/{{name}}.ts']).run(ctx({ name: 'app' }));

    expect(exists('index.ts')).toBe(false);
    expect(read('src/app.ts')).toBe('export {}');
  });

  it('accepts multiple pairs', async () => {
    mock({ 'a.txt': 'A', 'b.txt': 'B' });

    await move([
      ['a.txt', 'x/a.txt'],
      ['b.txt', 'y/b.txt'],
    ]).run(ctx());

    expect(read('x/a.txt')).toBe('A');
    expect(read('y/b.txt')).toBe('B');
    expect(exists('a.txt')).toBe(false);
  });

  it('skips (does not throw) when the source is missing', async () => {
    mock({});
    await move(['nope', 'out']).run(ctx());
    expect(exists('out')).toBe(false);
  });
});
