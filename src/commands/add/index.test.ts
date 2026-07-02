import mock from 'mock-fs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { add } from './index';
import { userProfilePath, type UserProfile } from '../../profile';
import { version } from '../../../package.json';
import type { BluprintConfig } from '../../config/types';

const HOME_DIR = os.homedir();
const PROFILE_DIR = path.join(HOME_DIR, '.bluprint');

// Mock the interactive prompt wrappers so tests can drive the source answer.
vi.mock('../../prompts', () => ({
  text: vi.fn(),
}));

// Silence clack log output during tests.
vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

// Stub the config singleton — `add` only cares that `load` populates `module`.
vi.mock('../../config', () => ({
  config: { module: undefined, load: vi.fn() },
}));

// checkVersion is exercised by its own tests; here we just assert it runs.
vi.mock('../../config/checkVersion', () => ({ checkVersion: vi.fn() }));

import * as prompts from '../../prompts';
import { log } from '@clack/prompts';
import { config } from '../../config';
import { checkVersion } from '../../config/checkVersion';

const readProfile = () =>
  JSON.parse(fs.readFileSync(userProfilePath, 'utf-8')) as UserProfile;

const seedProfile = (bluprints: UserProfile['bluprints'] = {}) => {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const profile: UserProfile = { version, token: '', bluprints };
  fs.writeFileSync(userProfilePath, JSON.stringify(profile));
};

/** Make `config.load` resolve, populating `config.module` with `moduleConfig`. */
const stubLoadedConfig = (moduleConfig: BluprintConfig) => {
  vi.mocked(config.load).mockImplementation(async () => {
    config.module = moduleConfig;
    return moduleConfig;
  });
};

describe('add command', () => {
  beforeEach(() => {
    mock({ [HOME_DIR]: {} });
    // The `profile` singleton's fs writes survive mock-fs resets between tests
    // (see dev-notes task 0001), so establish state explicitly each test.
    seedProfile({});
    config.module = undefined;
    // Default: loading any source yields a simple, valid bluprint config.
    stubLoadedConfig({ name: 'Test Bluprint', files: '**/*', ignores: [] });
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  it('adds a bluprint from a git URL given directly, without prompting', async () => {
    await add('reuters-graphics/test-bluprint');

    expect(prompts.text).not.toHaveBeenCalled();
    expect(config.load).toHaveBeenCalledWith('reuters-graphics/test-bluprint');
    expect(checkVersion).toHaveBeenCalledOnce();

    const { bluprints } = readProfile();
    expect(bluprints['Test Bluprint']).toEqual({
      url: 'reuters-graphics/test-bluprint',
      title: 'Test Bluprint',
      hint: undefined,
    });
    expect(log.info).toHaveBeenCalledOnce();
  });

  it('prompts for a source when none is given, then adds it', async () => {
    vi.mocked(prompts.text).mockResolvedValue('user/prompted-bluprint');

    await add();

    expect(prompts.text).toHaveBeenCalledOnce();
    expect(config.load).toHaveBeenCalledWith('user/prompted-bluprint');
    expect(readProfile().bluprints['Test Bluprint'].url).toBe(
      'user/prompted-bluprint'
    );
  });

  it('stores the title and hint from an object-form config name', async () => {
    stubLoadedConfig({
      name: { title: 'Fancy Bluprint', hint: 'a nice one' },
      files: '**/*',
      ignores: [],
    });

    await add('user/fancy');

    expect(readProfile().bluprints['Fancy Bluprint']).toEqual({
      url: 'user/fancy',
      title: 'Fancy Bluprint',
      hint: 'a nice one',
    });
  });

  it('logs an error and adds nothing for an invalid git URL', async () => {
    await add('plainword');

    expect(log.error).toHaveBeenCalledOnce();
    expect(config.load).not.toHaveBeenCalled();
    expect(readProfile().bluprints).toEqual({});
  });

  it('adds nothing when the config fails to load', async () => {
    // Simulate `config.load` bailing without populating `module` (the defensive
    // `if (!config.module) return` path). The resolved value is ignored by
    // `add`, which reads `config.module`.
    vi.mocked(config.load).mockImplementation(async () => {
      config.module = undefined;
      return { name: 'unused', files: '**/*', ignores: [] };
    });

    await add('user/broken');

    expect(config.load).toHaveBeenCalledOnce();
    expect(checkVersion).not.toHaveBeenCalled();
    expect(readProfile().bluprints).toEqual({});
  });
});
