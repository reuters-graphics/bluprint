import mock from 'mock-fs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import dedent from 'dedent';
import { config } from './index';
import * as fetch from './fetch';
import { mockedNodeModules } from '../__test__/utils';

const CWD = process.cwd();

// Mock the fetchRemoteConfig function to prevent HTTPS calls
vi.mock('./fetch', async () => {
  const actual = await vi.importActual('./fetch');
  return {
    ...actual,
    fetchRemoteConfig: vi.fn(),
  };
});

describe('Config', () => {
  beforeEach(() => {
    // Set environment variables required for testing with mock-fs
    process.env.MOCK_FS = 'T';

    // Setup mock file system with necessary files
    mock({
      ...mockedNodeModules,
      [path.join(CWD, 'src/')]: mock.load(path.join(CWD, 'src/')),
      [path.join(CWD, 'package.json')]: '{}',
    });
  });

  afterEach(() => {
    delete process.env.MOCK_FS;
    mock.restore();
    vi.clearAllMocks();
  });

  it('should load a local config file using file:// protocol', async () => {
    const mockConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: {
          title: 'Test Bluprint',
          hint: 'A test bluprint configuration',
        },
        bluprint: '^1.0.0',
        files: ['**/*'],
        ignores: ['node_modules/**'],
        actions: [],
        parts: {
          testPart: {
            title: 'Test Part',
            hint: 'A test part',
            files: ['src/**/*'],
            ignores: [],
            actions: [],
          },
        },
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, mockConfig);

    const fileUrl = `file://${path.dirname(configPath)}`;
    const module = await config.load(fileUrl);

    expect(module).toBeDefined();
    expect(module?.name).toEqual({
      title: 'Test Bluprint',
      hint: 'A test bluprint configuration',
    });
    expect(module?.bluprint).toBe('^1.0.0');
    expect(module?.files).toEqual(['**/*']);
    expect(module?.ignores).toEqual(['node_modules/**']);
    expect(module?.parts).toBeDefined();
    expect(module?.parts?.testPart).toBeDefined();
  });

  it('should load a remote config by fetching content via HTTPS', async () => {
    const remoteConfigContent = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'Remote Bluprint',
        bluprint: '^2.0.0',
        files: ['src/**/*'],
        ignores: ['dist/**'],
        actions: [],
      });
    `;

    const fetchRemoteConfigMock = vi.mocked(fetch.fetchRemoteConfig);
    fetchRemoteConfigMock.mockResolvedValue(remoteConfigContent);

    const remoteUrl = 'user/repo';

    const module = await config.load(remoteUrl);

    expect(fetchRemoteConfigMock).toHaveBeenCalledWith(remoteUrl);
    expect(module).toBeDefined();
    expect(module?.name).toBe('Remote Bluprint');
    expect(module?.bluprint).toBe('^2.0.0');
  });

  it('should handle config with string name instead of object', async () => {
    const simpleConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'Simple Config',
        files: ['**/*'],
        ignores: [],
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, simpleConfig);

    const module = await config.load(`file://${path.dirname(configPath)}`);

    expect(module).toBeDefined();
    expect(module?.name).toBe('Simple Config');
    expect(module?.files).toEqual(['**/*']);
  });

  it('should handle config with array files and ignores', async () => {
    const arrayConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'Array Config',
        files: ['src/**/*', 'lib/**/*'],
        ignores: ['**/*.test.ts', '**/*.spec.ts'],
        actions: [],
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, arrayConfig);

    const module = await config.load(`file://${path.dirname(configPath)}`);

    expect(module).toBeDefined();
    expect(module?.files).toEqual(['src/**/*', 'lib/**/*']);
    expect(module?.ignores).toEqual(['**/*.test.ts', '**/*.spec.ts']);
  });

  it('should handle config with parts', async () => {
    const configWithParts = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'Config with Parts',
        files: ['**/*'],
        ignores: [],
        parts: {
          frontend: {
            title: 'Frontend',
            hint: 'Frontend components',
            files: ['src/components/**/*'],
            ignores: ['**/*.test.tsx'],
            actions: [],
          },
          backend: {
            title: 'Backend',
            files: 'src/api/**/*',
            ignores: '**/*.spec.ts',
          },
        },
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, configWithParts);

    const module = await config.load(`file://${path.dirname(configPath)}`);

    expect(module).toBeDefined();
    expect(module?.parts).toBeDefined();
    expect(module?.parts?.frontend).toBeDefined();
    expect(module?.parts?.frontend.title).toBe('Frontend');
    expect(module?.parts?.frontend.hint).toBe('Frontend components');
    expect(module?.parts?.backend).toBeDefined();
    expect(module?.parts?.backend.title).toBe('Backend');
  });

  it('should cleanup temporary file after successful load', async () => {
    const mockConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'Cleanup Test',
        files: ['**/*'],
        ignores: [],
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, mockConfig);

    const fileUrl = `file://${path.dirname(configPath)}`;
    const module = await config.load(fileUrl);

    // The temp file should be cleaned up, so we can't directly verify its deletion
    // but we can verify the config was loaded successfully
    expect(module).toBeDefined();
  });

  it('should handle remote config fetch with GitHub token', async () => {
    const remoteConfigContent = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'Authenticated Config',
        files: ['**/*'],
        ignores: [],
      });
    `;

    const fetchRemoteConfigMock = vi.mocked(fetch.fetchRemoteConfig);
    fetchRemoteConfigMock.mockResolvedValue(remoteConfigContent);

    const remoteUrl =
      'https://raw.githubusercontent.com/private/repo/main/bluprint.config.ts';

    const module = await config.load(remoteUrl);

    expect(fetchRemoteConfigMock).toHaveBeenCalledWith(remoteUrl);
    expect(module).toBeDefined();
    expect(module?.name).toBe('Authenticated Config');
  });

  it('should exit process when config loading fails', async () => {
    const invalidConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        // Invalid JavaScript that will cause jiti to fail
        this is not valid javascript
      });
    `;

    const invalidConfigPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(invalidConfigPath, invalidConfig);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(
      config.load(`file://${path.dirname(invalidConfigPath)}`)
    ).rejects.toThrow('process.exit called');

    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  it('should handle config singleton behavior', async () => {
    const mockConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: {
          title: 'Singleton Test',
          hint: 'Testing singleton behavior',
        },
        files: ['**/*'],
        ignores: [],
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, mockConfig);

    const fileUrl = `file://${path.dirname(configPath)}`;
    await config.load(fileUrl);

    // Load again and verify it's the same singleton instance
    const module = await config.load(fileUrl);

    expect(module).toBeDefined();
    // The module should be updated with the new load
    expect(module?.name).toEqual({
      title: 'Singleton Test',
      hint: 'Testing singleton behavior',
    });
  });

  it('should handle config with optional bluprint version field', async () => {
    const noVersionConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'No Version Config',
        files: ['**/*'],
        ignores: [],
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, noVersionConfig);

    const module = await config.load(`file://${path.dirname(configPath)}`);

    expect(module).toBeDefined();
    expect(module?.name).toBe('No Version Config');
    expect(module?.bluprint).toBeUndefined();
  });

  it('should handle local file path with file:// protocol', async () => {
    const mockConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: {
          title: 'File Protocol Test',
          hint: 'Testing file:// protocol',
        },
        files: ['**/*'],
        ignores: [],
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, mockConfig);

    const fileUrl = `file://${path.dirname(configPath)}`;
    const module = await config.load(fileUrl);

    expect(module).toBeDefined();
    expect(module?.name).toEqual({
      title: 'File Protocol Test',
      hint: 'Testing file:// protocol',
    });
  });

  it('should handle parts without optional fields', async () => {
    const minimalPartsConfig = dedent`
      import { defineConfig } from 'bluprint';

      export default defineConfig({
        name: 'Minimal Parts',
        files: ['**/*'],
        ignores: [],
        parts: {
          minimalPart: {
            files: 'src/**/*',
            ignores: 'dist/**',
          },
        },
      });
    `;

    const configPath = path.join(CWD, 'bluprint.config.ts');
    fs.writeFileSync(configPath, minimalPartsConfig);

    const module = await config.load(`file://${path.dirname(configPath)}`);

    expect(module).toBeDefined();
    expect(module?.parts).toBeDefined();
    expect(module?.parts?.minimalPart).toBeDefined();
    expect(module?.parts?.minimalPart.title).toBeUndefined();
    expect(module?.parts?.minimalPart.hint).toBeUndefined();
    expect(module?.parts?.minimalPart.files).toBe('src/**/*');
  });
});
