import mock from 'mock-fs';
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { version } from '../../package.json';
import {
  mapLegacyProfile,
  profile,
  userProfilePath,
  legacyConfigPath,
  type UserProfile,
} from './index';

const HOME_DIR = os.homedir();

describe('mapLegacyProfile', () => {
  it('joins user/project into a url and keys by title', () => {
    const result = mapLegacyProfile({
      token: 'tok',
      bluprints: {
        'Graphics Kit': { user: 'reuters', project: 'kit' },
      },
    });

    expect(result.version).toBe(version);
    expect(result.token).toBe('tok');
    expect(result.bluprints['Graphics Kit']).toEqual({
      url: 'reuters/kit',
      title: 'Graphics Kit',
    });
  });

  it('defaults a missing token and skips entries without a url', () => {
    const result = mapLegacyProfile({
      bluprints: {
        Good: { user: 'u', project: 'p' },
        Bad: {}, // no user/project/url -> skipped
      },
    });

    expect(result.token).toBe('');
    expect(result.bluprints.Good.url).toBe('u/p');
    expect(result.bluprints.Bad).toBeUndefined();
  });

  it('handles an empty/legacy-less config', () => {
    expect(mapLegacyProfile({}).bluprints).toEqual({});
  });
});

// Uses the profile singleton — this file runs in its own vitest worker, so the
// singleton is fresh and profile.json is genuinely absent on first read.
describe('legacy import on first run', () => {
  afterEach(() => mock.restore());

  it('imports ~/.bluprintrc when no v1 profile exists yet', () => {
    mock({
      [path.join(HOME_DIR, '.bluprintrc')]: JSON.stringify({
        token: 'legacy-token',
        bluprints: {
          'My Kit': { user: 'reuters', project: 'my-kit' },
        },
      }),
    });

    // First read triggers the migration.
    expect(profile.bluprintTitles).toEqual(['My Kit']);
    expect(profile.token).toBe('legacy-token');
    expect(profile.getBluprintUrl('My Kit')).toBe('reuters/my-kit');

    // And it's now persisted as a v1 profile.
    const saved = JSON.parse(
      fs.readFileSync(userProfilePath, 'utf-8')
    ) as UserProfile;
    expect(saved.bluprints['My Kit'].url).toBe('reuters/my-kit');
    expect(fs.existsSync(legacyConfigPath)).toBe(true); // legacy left untouched
  });
});
