import mock from 'mock-fs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { token } from './index';
import { userProfilePath, type UserProfile } from '../../profile';
import { version } from '../../../package.json';

const HOME_DIR = os.homedir();
const PROFILE_DIR = path.join(HOME_DIR, '.bluprint');

// Mock the interactive prompt wrappers so tests can drive the answers.
vi.mock('../../prompts', () => ({
  confirm: vi.fn(),
  text: vi.fn(),
}));

// Silence clack log output during tests.
vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), info: vi.fn() },
}));

import * as prompts from '../../prompts';

const readProfile = () =>
  JSON.parse(fs.readFileSync(userProfilePath, 'utf-8')) as UserProfile;

const seedProfile = (token: string) => {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const profile: UserProfile = { version, token, bluprints: {} };
  fs.writeFileSync(userProfilePath, JSON.stringify(profile));
};

describe('token command', () => {
  beforeEach(() => {
    mock({ [HOME_DIR]: {} });
    // Seed a known-empty profile every test. The `profile` singleton's fs
    // writes survive mock-fs resets between tests (see .agents task 0001),
    // so we establish state explicitly rather than rely on the reset.
    seedProfile('');
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  it('saves a token passed directly without prompting', async () => {
    await token('direct-token-123');

    expect(readProfile().token).toBe('direct-token-123');
    expect(prompts.confirm).not.toHaveBeenCalled();
    expect(prompts.text).not.toHaveBeenCalled();
  });

  it('prompts for a token when none is stored', async () => {
    vi.mocked(prompts.text).mockResolvedValue('freshly-entered-token');

    await token();

    expect(prompts.text).toHaveBeenCalledOnce();
    expect(prompts.confirm).not.toHaveBeenCalled();
    expect(readProfile().token).toBe('freshly-entered-token');
  });

  it('replaces an existing token when the user confirms', async () => {
    seedProfile('old-token');
    vi.mocked(prompts.confirm).mockResolvedValue(true);
    vi.mocked(prompts.text).mockResolvedValue('new-token');

    await token();

    expect(prompts.confirm).toHaveBeenCalledOnce();
    expect(prompts.text).toHaveBeenCalledOnce();
    expect(readProfile().token).toBe('new-token');
  });

  it('keeps the existing token when the user declines', async () => {
    seedProfile('keep-me');
    vi.mocked(prompts.confirm).mockResolvedValue(false);

    await token();

    expect(prompts.confirm).toHaveBeenCalledOnce();
    expect(prompts.text).not.toHaveBeenCalled();
    expect(readProfile().token).toBe('keep-me');
  });
});
