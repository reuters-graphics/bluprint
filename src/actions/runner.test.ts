import { describe, it, expect, vi } from 'vitest';
import { runActions } from './runner';
import type { Action } from './types';

vi.mock('@clack/prompts', () => ({
  log: { warn: vi.fn(), success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

describe('runActions', () => {
  it('provides a default context (date parts + dirname)', async () => {
    const ctx = await runActions([]);
    expect(ctx).toHaveProperty('year');
    expect(ctx).toHaveProperty('dirname');
  });

  it('passes bluprintPart into the context', async () => {
    const ctx = await runActions([], 'my-part');
    expect(ctx.bluprintPart).toBe('my-part');
  });

  it('skips actions whose `when` returns false', async () => {
    const run = vi.fn();
    const action: Action = { name: 'x', when: () => false, run };
    await runActions([action]);
    expect(run).not.toHaveBeenCalled();
  });

  it('merges a returned partial into context for later actions', async () => {
    const seen: unknown[] = [];
    const contribute: Action = { name: 'a', run: () => ({ flag: true }) };
    const reader: Action = {
      name: 'b',
      run: (ctx) => {
        seen.push(ctx.flag);
      },
    };
    await runActions([contribute, reader]);
    expect(seen).toEqual([true]);
  });

  it('lets a returned value gate a later action via `when`', async () => {
    const run = vi.fn();
    const contribute: Action = { name: 'a', run: () => ({ ok: true }) };
    const gated: Action = { name: 'b', when: (ctx) => ctx.ok === true, run };
    await runActions([contribute, gated]);
    expect(run).toHaveBeenCalledOnce();
  });

  it('skips a throwing action but continues the run', async () => {
    const after = vi.fn();
    const boom: Action = {
      name: 'boom',
      run: () => {
        throw new Error('kaboom');
      },
    };
    const next: Action = { name: 'next', run: after };
    const ctx = await runActions([boom, next]);
    expect(after).toHaveBeenCalledOnce();
    expect(ctx).toHaveProperty('year');
  });

  it('aborts the run when a failOnError action throws', async () => {
    const after = vi.fn();
    const boom: Action = {
      name: 'boom',
      failOnError: true,
      run: () => {
        throw new Error('kaboom');
      },
    };
    const next: Action = { name: 'next', run: after };

    await expect(runActions([boom, next])).rejects.toThrow('kaboom');
    expect(after).not.toHaveBeenCalled();
  });
});
