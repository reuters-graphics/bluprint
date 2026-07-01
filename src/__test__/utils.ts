import { globSync } from 'glob';
import { zipObject } from 'es-toolkit';
import path from 'node:path';
import fs from 'node:fs';
import mock from 'mock-fs';

const __dirname = import.meta.dirname;

const nodeModuleDeps = globSync('*/', {
  cwd: path.resolve(__dirname, '../../node_modules'),
  absolute: true,
});

// Load only necessary packages from .pnpm for better performance
// Include jiti and any packages that might be imported by config files
const pnpmDir = path.resolve(__dirname, '../../node_modules/.pnpm');
const pnpmPackageDirs =
  fs.existsSync(pnpmDir) ?
    globSync(
      '{jiti@*,@clack+core@*,@clack+prompts@*,@reuters-graphics+clack@*}/',
      {
        cwd: pnpmDir,
        absolute: true,
      }
    )
  : [];

// Also load the virtual node_modules inside .pnpm
const pnpmVirtualNodeModules = path.resolve(pnpmDir, 'node_modules');

/**
 * Mocked node_modules, including only necessary packages from .pnpm for performance.
 * We use mock.load() on each package directory to recursively load all its contents.
 */
export const mockedNodeModules = {
  ...zipObject(
    nodeModuleDeps,
    nodeModuleDeps.map((d) => mock.load(d))
  ),
  ...zipObject(
    pnpmPackageDirs,
    pnpmPackageDirs.map((d) => mock.load(d))
  ),
  ...(fs.existsSync(pnpmVirtualNodeModules) ?
    { [pnpmVirtualNodeModules]: mock.load(pnpmVirtualNodeModules) }
  : {}),
};
