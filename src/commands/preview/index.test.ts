import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

vi.mock('../../config', () => ({
  config: { load: vi.fn(), module: undefined },
}));
vi.mock('../../config/checkVersion', () => ({ checkVersion: vi.fn() }));
vi.mock('../start/choosePart', () => ({ choosePart: vi.fn() }));
vi.mock('../../scaffold/copyLocal', () => ({ copyLocal: vi.fn() }));
vi.mock('../../actions', () => ({ runActions: vi.fn() }));
vi.mock('@clack/prompts', () => ({
  log: { error: vi.fn(), success: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { preview } from './index';
import { config } from '../../config';
import { choosePart } from '../start/choosePart';
import { copyLocal } from '../../scaffold/copyLocal';
import { runActions } from '../../actions';
import { log } from '@clack/prompts';

// 'Preview Test' slugifies to this.
const outDir = path.join(os.tmpdir(), 'bluprint', 'preview-test');
let srcDir: string;

beforeEach(() => {
  srcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-preview-src-'));
  fs.writeFileSync(
    path.join(srcDir, 'bluprint.config.ts'),
    'export default {}'
  );
  (config as unknown as { module: unknown }).module = {
    name: 'Preview Test',
    files: ['**/*'],
    ignores: [],
  };
  vi.mocked(choosePart).mockResolvedValue({
    part: null,
    files: ['**/*'],
    ignores: [],
    actions: [],
  });
});

afterEach(() => {
  fs.rmSync(srcDir, { recursive: true, force: true });
  fs.rmSync(outDir, { recursive: true, force: true });
  vi.clearAllMocks();
});

describe('preview', () => {
  it('loads the local config and scaffolds into <tmp>/bluprint/<slug>', async () => {
    await preview(srcDir);

    expect(config.load).toHaveBeenCalledWith(`file://${srcDir}`);
    expect(copyLocal).toHaveBeenCalledWith(srcDir, {
      files: ['**/*'],
      ignores: [],
    });
    expect(runActions).toHaveBeenCalledWith([], { bluprintPart: undefined });
    expect(fs.existsSync(outDir)).toBe(true);
    expect(log.success).toHaveBeenCalledOnce();
  });

  it('empties the stable output dir before each run', async () => {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'stale.txt'), 'old');

    await preview(srcDir);

    expect(fs.existsSync(path.join(outDir, 'stale.txt'))).toBe(false);
  });

  it('restores the original cwd afterward', async () => {
    const before = process.cwd();
    await preview(srcDir);
    expect(process.cwd()).toBe(before);
  });

  it('errors (and does not load) when there is no bluprint.config.ts', async () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-empty-'));

    await preview(empty);

    expect(log.error).toHaveBeenCalledOnce();
    expect(config.load).not.toHaveBeenCalled();

    fs.rmSync(empty, { recursive: true, force: true });
  });
});
