import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../profile', () => ({
  profile: {
    bluprintTitles: [] as string[],
    promptForBluprint: vi.fn(),
    getBluprintUrl: vi.fn(),
  },
}));
vi.mock('../../config', () => ({
  config: { load: vi.fn(), module: undefined },
}));
vi.mock('../../scaffold', () => ({ scaffold: vi.fn() }));
vi.mock('./choosePart', () => ({ choosePart: vi.fn() }));
vi.mock('../../actions', () => ({ runActions: vi.fn() }));
vi.mock('../../runtime', () => ({
  runtime: { interactive: true },
  isInteractive: vi.fn(() => true),
}));
vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn(), success: vi.fn(), warn: vi.fn() },
}));

import { start } from './index';
import { profile } from '../../profile';
import { config } from '../../config';
import { scaffold } from '../../scaffold';
import { choosePart } from './choosePart';
import { runActions } from '../../actions';
import { isInteractive } from '../../runtime';
import { log } from '@clack/prompts';

const setSelection = (overrides = {}) =>
  vi.mocked(choosePart).mockResolvedValue({
    part: null,
    files: ['**/*'],
    ignores: [],
    actions: [],
    ...overrides,
  });

beforeEach(() => {
  (config as unknown as { module: unknown }).module = {
    name: 'Test Bluprint',
    files: ['**/*'],
    ignores: [],
  };
  (profile as unknown as { bluprintTitles: string[] }).bluprintTitles = ['x'];
  vi.mocked(profile.getBluprintUrl).mockReturnValue(undefined);
  setSelection();
});

afterEach(() => vi.clearAllMocks());

describe('start', () => {
  it('treats a non-registered arg as a direct git URL', async () => {
    await start('user/repo');

    expect(config.load).toHaveBeenCalledWith('user/repo');
    expect(scaffold).toHaveBeenCalledWith('user/repo', {
      files: ['**/*'],
      ignores: [],
    });
  });

  it('resolves a registered title to its URL', async () => {
    vi.mocked(profile.getBluprintUrl).mockReturnValue('reuters/kit');

    await start('My Kit');

    expect(profile.getBluprintUrl).toHaveBeenCalledWith('My Kit');
    expect(config.load).toHaveBeenCalledWith('reuters/kit');
  });

  it('prompts for a bluprint when no arg is given', async () => {
    vi.mocked(profile.promptForBluprint).mockResolvedValue('prompted/repo');

    await start();

    expect(profile.promptForBluprint).toHaveBeenCalledOnce();
    expect(config.load).toHaveBeenCalledWith('prompted/repo');
  });

  it('passes the chosen part and actions to runActions', async () => {
    const actions = [{ name: 'a', run: () => {} }];
    setSelection({ part: 'api', files: ['api/**'], ignores: [], actions });

    await start('user/repo');

    expect(scaffold).toHaveBeenCalledWith('user/repo', {
      files: ['api/**'],
      ignores: [],
    });
    expect(runActions).toHaveBeenCalledWith(actions, {
      bluprintPart: 'api',
      values: {},
      failFast: false,
    });
  });

  it('rejects file:// sources and does not scaffold', async () => {
    await start('file:///local/bluprint');

    expect(log.error).toHaveBeenCalledOnce();
    expect(config.load).not.toHaveBeenCalled();
    expect(scaffold).not.toHaveBeenCalled();
  });

  it('does nothing when no arg and no bluprints installed', async () => {
    (profile as unknown as { bluprintTitles: string[] }).bluprintTitles = [];

    await start();

    expect(log.info).toHaveBeenCalledOnce();
    expect(profile.promptForBluprint).not.toHaveBeenCalled();
    expect(scaffold).not.toHaveBeenCalled();
  });

  describe('non-interactive mode', () => {
    let exitSpy: { mockRestore: () => void };

    beforeEach(() => {
      vi.mocked(isInteractive).mockReturnValue(false);
      exitSpy = vi.spyOn(process, 'exit').mockImplementation(((
        code?: number
      ) => {
        throw new Error(`exit:${code}`);
      }) as never);
    });
    afterEach(() => exitSpy.mockRestore());

    it('runs actions with failFast and never prompts', async () => {
      await start('user/repo', { ci: true });

      expect(profile.promptForBluprint).not.toHaveBeenCalled();
      expect(runActions).toHaveBeenCalledWith([], {
        bluprintPart: undefined,
        values: {},
        failFast: true,
      });
    });

    it('errors (exit 1) when no bluprint arg is given', async () => {
      await expect(start(undefined, { ci: true })).rejects.toThrow('exit:1');
      expect(log.error).toHaveBeenCalledOnce();
      expect(scaffold).not.toHaveBeenCalled();
    });
  });
});
