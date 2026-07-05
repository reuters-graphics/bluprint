import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { remove } from './index';
import type { ActionContext } from '../types';

const ctx = (): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
});

// `remove` globs the real filesystem via `glob`, whose fs access isn't reliably
// intercepted by mock-fs across platforms — so use a real temp dir and chdir in.
let dir: string;
let originalCwd: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bluprint-remove-'));
  originalCwd = process.cwd();
  process.chdir(dir);
});
afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(dir, { recursive: true, force: true });
});

const write = (p: string, contents = ''): void => {
  const full = path.join(dir, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
};
const exists = (p: string): boolean => fs.existsSync(path.join(dir, p));

describe('remove action', () => {
  it('removes files matching a glob', async () => {
    write('a.log');
    write('b.log');
    write('keep.txt');

    await remove('*.log').run(ctx());

    expect(exists('a.log')).toBe(false);
    expect(exists('b.log')).toBe(false);
    expect(exists('keep.txt')).toBe(true);
  });

  it('removes a directory', async () => {
    write('coverage/index.html');
    write('src/a.ts');

    await remove('coverage').run(ctx());

    expect(exists('coverage')).toBe(false);
    expect(exists('src/a.ts')).toBe(true);
  });

  it('accepts multiple globs', async () => {
    write('a.log');
    write('tmp/x');
    write('keep.txt');

    await remove(['*.log', 'tmp']).run(ctx());

    expect(exists('a.log')).toBe(false);
    expect(exists('tmp')).toBe(false);
    expect(exists('keep.txt')).toBe(true);
  });
});
