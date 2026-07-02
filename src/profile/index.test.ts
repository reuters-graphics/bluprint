import mock from 'mock-fs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { profile, userProfilePath, type UserProfile } from './index';
import { version } from '../../package.json';

const HOME_DIR = os.homedir();
const PROFILE_DIR = path.join(HOME_DIR, '.bluprint');

describe('Profile', () => {
  beforeEach(() => {
    // Setup mock file system
    mock({
      [HOME_DIR]: {},
    });
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  describe('userProfilePath', () => {
    it('should be set to the correct path in the home directory', () => {
      expect(userProfilePath).toBe(
        path.join(HOME_DIR, '.bluprint/profile.json')
      );
    });
  });

  describe('token', () => {
    it('should return empty string when no profile exists', () => {
      const token = profile.token;
      expect(token).toBe('');
    });

    it('should create profile directory and file when reading token for the first time', () => {
      const _token = profile.token;

      expect(fs.existsSync(PROFILE_DIR)).toBe(true);
      expect(fs.existsSync(userProfilePath)).toBe(true);
    });

    it('should return the token from an existing profile', () => {
      // Create a profile with a token
      fs.mkdirSync(PROFILE_DIR, { recursive: true });
      const existingProfile: UserProfile = {
        version,
        token: 'test-token-123',
        bluprints: {},
      };
      fs.writeFileSync(userProfilePath, JSON.stringify(existingProfile));

      const token = profile.token;
      expect(token).toBe('test-token-123');
    });

    it('should set the token and persist it to the profile', () => {
      profile.token = 'new-token-456';

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.token).toBe('new-token-456');
    });

    it('should update the token in an existing profile', () => {
      // Create a profile with an existing token
      fs.mkdirSync(PROFILE_DIR, { recursive: true });
      const existingProfile: UserProfile = {
        version,
        token: 'old-token',
        bluprints: {
          'existing-bluprint': {
            url: 'https://github.com/user/repo',
            title: 'existing-bluprint',
          },
        },
      };
      fs.writeFileSync(userProfilePath, JSON.stringify(existingProfile));

      profile.token = 'updated-token';

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.token).toBe('updated-token');
      // Ensure bluprints are preserved
      expect(savedProfile.bluprints['existing-bluprint']).toBeDefined();
    });
  });

  describe('addBluprint', () => {
    it('should add a bluprint to an empty profile', () => {
      profile.addBluprint({
        url: 'https://github.com/user/new-repo',
        title: 'my-bluprint',
        hint: 'A helpful hint',
      });

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.bluprints['my-bluprint']).toEqual({
        url: 'https://github.com/user/new-repo',
        title: 'my-bluprint',
        hint: 'A helpful hint',
      });
    });

    it('should add a bluprint without a hint', () => {
      profile.addBluprint({
        url: 'user/repo',
        title: 'no-hint-bluprint',
      });

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.bluprints['no-hint-bluprint']).toEqual({
        url: 'user/repo',
        title: 'no-hint-bluprint',
      });
    });

    it('should add multiple bluprints to the profile', () => {
      profile.addBluprint({
        url: 'user/repo1',
        title: 'multi-bluprint-1',
      });

      profile.addBluprint({
        url: 'user/repo2',
        title: 'multi-bluprint-2',
      });

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      // Both bluprints should be present
      expect(savedProfile.bluprints['multi-bluprint-1']).toBeDefined();
      expect(savedProfile.bluprints['multi-bluprint-2']).toBeDefined();
      expect(savedProfile.bluprints['multi-bluprint-1'].url).toBe('user/repo1');
      expect(savedProfile.bluprints['multi-bluprint-2'].url).toBe('user/repo2');
    });

    it('should overwrite an existing bluprint with the same title', () => {
      profile.addBluprint({
        url: 'user/old-repo',
        title: 'same-title',
      });

      profile.addBluprint({
        url: 'user/new-repo',
        title: 'same-title',
        hint: 'New hint',
      });

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.bluprints['same-title']).toEqual({
        url: 'user/new-repo',
        title: 'same-title',
        hint: 'New hint',
      });
    });

    it('should preserve existing bluprints when adding a new one', () => {
      fs.mkdirSync(PROFILE_DIR, { recursive: true });
      const existingProfile: UserProfile = {
        version,
        token: 'my-token',
        bluprints: {
          'existing-bluprint': {
            url: 'user/existing',
            title: 'existing-bluprint',
          },
        },
      };
      fs.writeFileSync(userProfilePath, JSON.stringify(existingProfile));

      profile.addBluprint({
        url: 'user/new',
        title: 'new-bluprint',
      });

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.bluprints['existing-bluprint']).toBeDefined();
      expect(savedProfile.bluprints['new-bluprint']).toBeDefined();
      expect(savedProfile.token).toBe('my-token');
    });
  });

  describe('removeBluprint', () => {
    it('should remove an existing bluprint', () => {
      fs.mkdirSync(PROFILE_DIR, { recursive: true });
      const existingProfile: UserProfile = {
        version,
        token: '',
        bluprints: {
          'to-remove': {
            url: 'user/repo',
            title: 'to-remove',
          },
        },
      };
      fs.writeFileSync(userProfilePath, JSON.stringify(existingProfile));

      profile.removeBluprint('to-remove');

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.bluprints['to-remove']).toBeUndefined();
    });

    it('should not throw when removing a non-existent bluprint', () => {
      fs.mkdirSync(PROFILE_DIR, { recursive: true });
      const existingProfile: UserProfile = {
        version,
        token: '',
        bluprints: {},
      };
      fs.writeFileSync(userProfilePath, JSON.stringify(existingProfile));

      expect(() => profile.removeBluprint('non-existent')).not.toThrow();
    });

    it('should preserve other bluprints when removing one', () => {
      fs.mkdirSync(PROFILE_DIR, { recursive: true });
      const existingProfile: UserProfile = {
        version,
        token: 'token',
        bluprints: {
          'keep-this': {
            url: 'user/keep',
            title: 'keep-this',
          },
          'remove-this': {
            url: 'user/remove',
            title: 'remove-this',
          },
        },
      };
      fs.writeFileSync(userProfilePath, JSON.stringify(existingProfile));

      profile.removeBluprint('remove-this');

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.bluprints['keep-this']).toBeDefined();
      expect(savedProfile.bluprints['remove-this']).toBeUndefined();
      expect(savedProfile.token).toBe('token');
    });

    it('should handle removing a non-existent bluprint without throwing', () => {
      // First ensure profile exists
      const _token = profile.token;
      expect(_token).toBeDefined();

      // Try to remove something that doesn't exist - should not throw
      expect(() =>
        profile.removeBluprint('definitely-not-in-profile')
      ).not.toThrow();

      // Verify profile is still valid
      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(
        savedProfile.bluprints['definitely-not-in-profile']
      ).toBeUndefined();
    });
  });

  describe('version handling', () => {
    it('should create profile with current version', () => {
      const _token = profile.token;

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.version).toBe(version);
    });

    it('should update version when reading profile with old version', () => {
      fs.mkdirSync(PROFILE_DIR, { recursive: true });
      const oldProfile: UserProfile = {
        version: '0.0.1',
        token: 'old-token',
        bluprints: {},
      };
      fs.writeFileSync(userProfilePath, JSON.stringify(oldProfile));

      const _token = profile.token;

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.version).toBe(version);
      expect(savedProfile.token).toBe('old-token');
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      // The profile is already the singleton instance
      // This test verifies that multiple operations work on the same instance
      profile.token = 'test-token';
      profile.addBluprint({
        url: 'user/repo',
        title: 'test-bluprint',
      });

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.token).toBe('test-token');
      expect(savedProfile.bluprints['test-bluprint']).toBeDefined();
    });
  });

  describe('file system edge cases', () => {
    it('should create parent directory if it does not exist', () => {
      expect(fs.existsSync(PROFILE_DIR)).toBe(false);

      profile.token = 'test';

      expect(fs.existsSync(PROFILE_DIR)).toBe(true);
      expect(fs.existsSync(userProfilePath)).toBe(true);
    });

    it('should handle file:// protocol URLs in bluprint', () => {
      profile.addBluprint({
        url: 'file:///local/path/to/bluprint',
        title: 'local-bluprint',
      });

      const savedProfile = JSON.parse(
        fs.readFileSync(userProfilePath, 'utf-8')
      ) as UserProfile;
      expect(savedProfile.bluprints['local-bluprint'].url).toBe(
        'file:///local/path/to/bluprint'
      );
    });
  });
});
