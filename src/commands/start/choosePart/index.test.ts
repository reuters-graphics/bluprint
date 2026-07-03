import { describe, it, expect, afterEach, vi } from 'vitest';
import { choosePart } from './index';
import { runtime } from '../../../runtime';
import type { BluprintConfig } from '../../../config/types';

vi.mock('../../../prompts', () => ({
  confirm: vi.fn(),
  select: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import * as prompts from '../../../prompts';

const baseConfig = (
  overrides: Partial<BluprintConfig> = {}
): BluprintConfig => ({
  name: 'Test',
  files: ['**/*'],
  ignores: [],
  actions: [{ name: 'top', run: () => {} }],
  ...overrides,
});

describe('choosePart', () => {
  afterEach(() => {
    vi.clearAllMocks();
    runtime.interactive = true;
  });

  it('returns the whole bluprint when there are no parts', async () => {
    const result = await choosePart(baseConfig());

    expect(prompts.confirm).not.toHaveBeenCalled();
    expect(result.part).toBeNull();
    expect(result.files).toEqual(['**/*']);
    expect(result.actions).toHaveLength(1);
  });

  it('returns the whole bluprint when the user declines a part', async () => {
    vi.mocked(prompts.confirm).mockResolvedValue(false);

    const result = await choosePart(
      baseConfig({ parts: { api: { files: ['api/**'], ignores: [] } } })
    );

    expect(prompts.confirm).toHaveBeenCalledOnce();
    expect(prompts.select).not.toHaveBeenCalled();
    expect(result.part).toBeNull();
    expect(result.files).toEqual(['**/*']);
  });

  it('returns the chosen part files/ignores/actions', async () => {
    vi.mocked(prompts.confirm).mockResolvedValue(true);
    vi.mocked(prompts.select).mockResolvedValue('api');

    const result = await choosePart(
      baseConfig({
        parts: {
          api: {
            files: ['api/**'],
            ignores: ['api/secrets'],
            actions: [{ name: 'part', run: () => {} }],
          },
        },
      })
    );

    expect(result.part).toBe('api');
    expect(result.files).toEqual(['api/**']);
    expect(result.ignores).toEqual(['api/secrets']);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].name).toBe('part');
  });

  it('falls back to top-level actions when the part defines none', async () => {
    vi.mocked(prompts.confirm).mockResolvedValue(true);
    vi.mocked(prompts.select).mockResolvedValue('docs');

    const result = await choosePart(
      baseConfig({ parts: { docs: { files: ['docs/**'], ignores: [] } } })
    );

    expect(result.part).toBe('docs');
    expect(result.actions[0].name).toBe('top'); // fell back to config.actions
  });

  it('selects a requested part without prompting', async () => {
    const result = await choosePart(
      baseConfig({ parts: { api: { files: ['api/**'], ignores: [] } } }),
      'api'
    );

    expect(prompts.confirm).not.toHaveBeenCalled();
    expect(prompts.select).not.toHaveBeenCalled();
    expect(result.part).toBe('api');
    expect(result.files).toEqual(['api/**']);
  });

  it('throws on an unknown requested part', async () => {
    await expect(
      choosePart(
        baseConfig({ parts: { api: { files: ['api/**'], ignores: [] } } }),
        'nope'
      )
    ).rejects.toThrow(/Unknown part "nope"/);
  });

  it('scaffolds the whole bluprint non-interactively when parts exist', async () => {
    runtime.interactive = false;

    const result = await choosePart(
      baseConfig({ parts: { api: { files: ['api/**'], ignores: [] } } })
    );

    expect(prompts.confirm).not.toHaveBeenCalled();
    expect(result.part).toBeNull();
    expect(result.files).toEqual(['**/*']);
  });
});
