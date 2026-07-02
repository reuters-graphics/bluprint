import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { BluprintConfig } from './types';
import { createJiti, type Jiti } from 'jiti';
import { pathToFileURL } from 'node:url';

const __dirname = import.meta.dirname;
const require = createRequire(import.meta.url);

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
    // A fetched config is written to (and loaded from) a temp directory with no
    // `node_modules`, so its `import … from '@reuters-graphics/bluprint'` can't
    // resolve normally. Alias it to this package's own entry — resolvable via
    // Node self-reference because this module lives inside the package.
    const alias: Record<string, string> = {};
    try {
      alias['@reuters-graphics/bluprint'] = require.resolve(
        '@reuters-graphics/bluprint'
      );
    } catch {
      // Fall back to default resolution (e.g. if run in an unusual layout).
    }
    jiti = createJiti(import.meta.url, { alias });
  }

  const configModule = (await jiti.import(configFileURL, {
    default: true,
  })) as BluprintConfig;

  return configModule;
};
