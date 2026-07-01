import mock from 'mock-fs';
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { remove } from './index';
import type { ActionContext } from '../types';

const CWD = process.cwd();
const ctx = (): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
});
const exists = (p: string) => fs.existsSync(path.join(CWD, p));

describe('remove action', () => {
  afterEach(() => mock.restore());

  it('removes files matching a glob', async () => {
    mock({ 'a.log': '', 'b.log': '', 'keep.txt': '' });

    await remove('*.log').run(ctx());

    expect(exists('a.log')).toBe(false);
    expect(exists('b.log')).toBe(false);
    expect(exists('keep.txt')).toBe(true);
  });

  it('removes a directory', async () => {
    mock({ coverage: { 'index.html': '' }, src: { 'a.ts': '' } });

    await remove('coverage').run(ctx());

    expect(exists('coverage')).toBe(false);
    expect(exists('src/a.ts')).toBe(true);
  });

  it('accepts multiple globs', async () => {
    mock({ 'a.log': '', tmp: { x: '' }, 'keep.txt': '' });

    await remove(['*.log', 'tmp']).run(ctx());

    expect(exists('a.log')).toBe(false);
    expect(exists('tmp')).toBe(false);
    expect(exists('keep.txt')).toBe(true);
  });
});
