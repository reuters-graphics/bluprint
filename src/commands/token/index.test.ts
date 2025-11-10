import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { token } from '../../index.js';
import os from 'os';
import mockFs from 'mock-fs';
import fs from 'fs';

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: token', () => {
  beforeAll(() => {
    const userConfig = {
      bluprints: {},
    };

    mockFs({
      [userConfigPath]: JSON.stringify(userConfig),
    });
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Adds a token to user config', async () => {
    await token(null, ['ABCD1234']);

    const { token: accessToken } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(accessToken).toEqual('ABCD1234');
  });

  it('Updates a token', async () => {
    await token(null, [true, 'ZYXW9876']);

    const { token: accessToken } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(accessToken).toEqual('ZYXW9876');
  });
});
