import { describe, it, expect, vi } from 'vitest';
import { run } from './index';
import type { ActionContext } from '../types';

const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});

describe('run action', () => {
  it('calls the function with the run context', async () => {
    const fn = vi.fn();
    const c = ctx({ name: 'app' });

    await run(fn).run(c);

    expect(fn).toHaveBeenCalledWith(c);
  });

  it('returns the function result to merge into context', async () => {
    const result = await run(() => ({ id: 42 })).run(ctx());
    expect(result).toEqual({ id: 42 });
  });

  it('supports async functions', async () => {
    const result = await run(async () => ({ done: true })).run(ctx());
    expect(result).toEqual({ done: true });
  });

  it('passes through name / when / failOnError', () => {
    const when = () => true;
    const action = run(() => {}, { when, failOnError: true });
    expect(action.name).toBe('run');
    expect(action.when).toBe(when);
    expect(action.failOnError).toBe(true);
  });
});
