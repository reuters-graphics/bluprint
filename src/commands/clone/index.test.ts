import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('../../scaffold', () => ({ scaffold: vi.fn() }));
vi.mock('@clack/prompts', () => ({
  log: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import { clone } from './index';
import { scaffold } from '../../scaffold';
import { log } from '@clack/prompts';

describe('clone', () => {
  afterEach(() => vi.clearAllMocks());

  it('scaffolds the whole repo, including the config file', async () => {
    await clone('user/repo');

    expect(scaffold).toHaveBeenCalledWith('user/repo', {
      files: ['**/*'],
      ignores: [],
      excludeConfig: false,
    });
    expect(log.success).toHaveBeenCalledOnce();
  });

  it('rejects an invalid repo URL without scaffolding', async () => {
    await clone('not a repo!!');

    expect(scaffold).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledOnce();
  });
});
