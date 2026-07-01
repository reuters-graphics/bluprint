import { describe, it, expect, afterEach, vi } from 'vitest';
import { log } from './index';
import type { ActionContext } from '../types';

const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});

describe('log action', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders mustache against context before printing', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await log('Hello {{name}}').run(ctx({ name: 'Sam' }));

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('Hello Sam');
  });

  it('strips chalk-template tags into styled (here: plain) text', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await log('Run {yellow {{cmd}}}').run(ctx({ cmd: 'pnpm i' }));

    // Colors are disabled in the test env, so the tag resolves to its content.
    expect(spy.mock.calls[0][0]).toContain('pnpm i');
    expect(spy.mock.calls[0][0]).not.toContain('{yellow');
  });
});
