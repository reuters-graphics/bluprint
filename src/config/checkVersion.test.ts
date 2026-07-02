import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { error: vi.fn(), warn: vi.fn() },
}));

import { checkVersion } from './checkVersion';
import { log } from '@clack/prompts';
import type { BluprintConfig } from './types';

const cfg = (bluprint?: string): BluprintConfig => ({
  name: 'Test',
  files: ['**/*'],
  ignores: [],
  bluprint,
});

describe('checkVersion', () => {
  afterEach(() => vi.restoreAllMocks());

  it('no-ops when the bluprint declares no version', () => {
    checkVersion(cfg());
    expect(log.error).not.toHaveBeenCalled();
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('no-ops when the installed CLI satisfies the constraint', () => {
    checkVersion(cfg('>=0.0.1'));
    expect(log.error).not.toHaveBeenCalled();
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('errors and exits when the CLI is too old', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit');
    }) as never);

    expect(() => checkVersion(cfg('>=100.0.0'))).toThrow('exit');
    expect(log.error).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('warns (does not exit) on a non-fatal mismatch', () => {
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as never);

    checkVersion(cfg('<0.0.1'));

    expect(log.warn).toHaveBeenCalledOnce();
    expect(exit).not.toHaveBeenCalled();
  });
});
