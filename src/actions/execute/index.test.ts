import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { execute } from './index';
import type { ActionContext } from '../types';

vi.mock('node:child_process', () => ({ spawn: vi.fn() }));

const startSpy = vi.fn();
const stopSpy = vi.fn();
vi.mock('@clack/prompts', () => ({
  spinner: vi.fn(() => ({ start: startSpy, stop: stopSpy, message: vi.fn() })),
}));

const ctx = (): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
});

// A fake ChildProcess that closes with `code` on the next tick, after the
// action has attached its 'close' listener.
const fakeChild = (code = 0) => {
  const child = new EventEmitter();
  process.nextTick(() => child.emit('close', code));
  return child;
};

beforeEach(() => {
  vi.mocked(spawn).mockImplementation(() => fakeChild(0) as never);
});
afterEach(() => vi.clearAllMocks());

describe('execute action', () => {
  it('runs a string command via the shell, inheriting stdio (not silent)', async () => {
    await execute('pnpm install').run(ctx());

    expect(spawn).toHaveBeenCalledWith(
      'pnpm install',
      [],
      expect.objectContaining({ shell: true, stdio: 'inherit' })
    );
    expect(startSpy).not.toHaveBeenCalled(); // no spinner when output is shown
  });

  it('runs an array command without a shell, splitting args', async () => {
    await execute(['git', 'init', '-q']).run(ctx());

    expect(spawn).toHaveBeenCalledWith(
      'git',
      ['init', '-q'],
      expect.objectContaining({ shell: false, stdio: 'inherit' })
    );
  });

  it('shows a spinner and ignores stdio when silent', async () => {
    await execute('pnpm install', { silent: true }).run(ctx());

    expect(spawn).toHaveBeenCalledWith(
      'pnpm install',
      [],
      expect.objectContaining({ shell: true, stdio: 'ignore' })
    );
    expect(startSpy).toHaveBeenCalledOnce();
    expect(stopSpy).toHaveBeenCalledOnce();
  });

  it('surfaces a non-zero exit code in the spinner stop message', async () => {
    vi.mocked(spawn).mockImplementation(() => fakeChild(1) as never);

    await execute('false', { silent: true }).run(ctx());

    expect(stopSpy).toHaveBeenCalledWith(
      expect.stringContaining('exit code 1')
    );
  });
});
