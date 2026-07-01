import fs from 'node:fs';
import path from 'node:path';
import type { BluprintConfig } from './types';
import { createJiti, type Jiti } from 'jiti';
import { pathToFileURL } from 'node:url';

const __dirname = import.meta.dirname;

/**
 * Loads user defined config from `bluprint.config.ts` file in project root
 * and attaches merged config to context singleton.
 */
export const loadConfig = async (configPath: string) => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Could not find config at ${configPath}`);
  }

  const configFileURL = pathToFileURL(configPath).toString();

  let jiti: Jiti;

  // Alias the library and disable caching for testing
  // using mocked filesystem
  if (process.env.VITEST && process.env.MOCK_FS) {
    jiti = createJiti(import.meta.url, {
      alias: {
        bluprint: path.join(__dirname, 'index.ts'),
      },
      fsCache: false,
      moduleCache: false,
    });
  } else {
    jiti = createJiti(import.meta.url);
  }

  const configModule = (await jiti.import(configFileURL, {
    default: true,
  })) as BluprintConfig;

  return configModule;
};
