import { describe, it, expect, afterEach, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { execute } from './index';
import type { ActionContext } from '../types';

vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }));

const ctx = (): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
});

describe('execute action', () => {
  afterEach(() => vi.clearAllMocks());

  it('runs a string command via the shell', async () => {
    await execute('pnpm install').run(ctx());

    expect(spawnSync).toHaveBeenCalledWith(
      'pnpm install',
      expect.objectContaining({ shell: true, stdio: 'inherit' })
    );
  });

  it('runs an array command without a shell, splitting args', async () => {
    await execute(['git', 'init', '-q']).run(ctx());

    expect(spawnSync).toHaveBeenCalledWith(
      'git',
      ['init', '-q'],
      expect.objectContaining({ stdio: 'inherit' })
    );
  });

  it('pipes stdio when silent', async () => {
    await execute('ls', { silent: true }).run(ctx());

    expect(spawnSync).toHaveBeenCalledWith(
      'ls',
      expect.objectContaining({ stdio: 'pipe' })
    );
  });
});
