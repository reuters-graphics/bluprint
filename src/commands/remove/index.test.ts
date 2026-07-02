import mock from 'mock-fs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { remove } from './index';
import { userProfilePath, type UserProfile } from '../../profile';
import { version } from '../../../package.json';

const HOME_DIR = os.homedir();
const PROFILE_DIR = path.join(HOME_DIR, '.bluprint');

// Mock the interactive prompt wrappers so tests can drive the selection.
vi.mock('../../prompts', () => ({
  select: vi.fn(),
}));

// Silence clack log output during tests.
vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import * as prompts from '../../prompts';

const readProfile = () =>
  JSON.parse(fs.readFileSync(userProfilePath, 'utf-8')) as UserProfile;

const seedProfile = (bluprints: UserProfile['bluprints']) => {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const profile: UserProfile = { version, token: '', bluprints };
  fs.writeFileSync(userProfilePath, JSON.stringify(profile));
};

const bluprint = (title: string) => ({
  url: `user/${title}`,
  title,
});

describe('remove command', () => {
  beforeEach(() => {
    mock({ [HOME_DIR]: {} });
    // The `profile` singleton's fs writes survive mock-fs resets between tests
    // (see dev-notes task 0001), so establish state explicitly each test.
    seedProfile({});
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  it('removes a bluprint named directly, without prompting', async () => {
    seedProfile({ alpha: bluprint('alpha'), beta: bluprint('beta') });

    await remove('alpha');

    expect(prompts.select).not.toHaveBeenCalled();
    const { bluprints } = readProfile();
    expect(bluprints.alpha).toBeUndefined();
    expect(bluprints.beta).toBeDefined();
  });

  it('prompts for a bluprint when no name is given', async () => {
    seedProfile({ alpha: bluprint('alpha'), beta: bluprint('beta') });
    vi.mocked(prompts.select).mockResolvedValue('beta');

    await remove();

    expect(prompts.select).toHaveBeenCalledOnce();
    const { bluprints } = readProfile();
    expect(bluprints.beta).toBeUndefined();
    expect(bluprints.alpha).toBeDefined();
  });

  it('does nothing when there are no bluprints installed', async () => {
    // beforeEach already seeded an empty profile.
    await remove();

    expect(prompts.select).not.toHaveBeenCalled();
    expect(readProfile().bluprints).toEqual({});
  });

  it('does not remove anything when the given name is unknown', async () => {
    seedProfile({ alpha: bluprint('alpha') });

    await remove('nonexistent');

    expect(prompts.select).not.toHaveBeenCalled();
    expect(readProfile().bluprints.alpha).toBeDefined();
  });
});
