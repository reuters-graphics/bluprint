import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import { handleActions } from '../../index.js';
import path from 'path';
import childProcess from 'child_process';

vi.mock('child_process', () => {
  const spawnSyncMock = vi.fn((cmd: string, args?: string[]) => ({
    status: 0,
    stdout: Buffer.from(''),
    stderr: Buffer.from(''),
  }));

  return {
    default: {
      spawnSync: spawnSyncMock,
    },
    spawnSync: spawnSyncMock,
  };
});

const getPackageDeps = () => {
  const packageJson = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8');
  return JSON.parse(packageJson).dependencies;
};

describe('Test action: execute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Executes a simple process', async () => {
    const actions = [{
      action: 'execute',
      cmds: [['echo', ['cat']]],
    }];

    await handleActions(actions, undefined);

    expect(childProcess.spawnSync).toHaveBeenCalledWith('echo', ['cat'], expect.any(Object));
  });

  it('Executes a longer running process', async () => {
    // Mock yarn add to actually modify package.json
    const originalSpawnSync = (childProcess.spawnSync as any).getMockImplementation();
    (childProcess.spawnSync as any).mockImplementation((cmd: string, args?: string[], options?: any) => {
      if (cmd === 'yarn' && args?.[0] === 'add' && args?.[1] === 'react') {
        // Simulate adding react to package.json
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        pkg.dependencies.react = '^18.0.0';
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      } else if (cmd === 'yarn' && args?.[0] === 'remove' && args?.[1] === 'react') {
        // Simulate removing react from package.json
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        delete pkg.dependencies.react;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      }
      return { status: 0, stdout: Buffer.from(''), stderr: Buffer.from('') };
    });

    const addActions = [{
      action: 'execute',
      cmds: [['yarn', ['add', 'react']]],
    }];

    await handleActions(addActions);

    expect(childProcess.spawnSync).toHaveBeenCalledWith('yarn', ['add', 'react'], expect.any(Object));

    expect(getPackageDeps()).toHaveProperty('react');

    const removeActions = [{
      action: 'execute',
      cmds: [['yarn', ['remove', 'react']]],
    }];

    await handleActions(removeActions, undefined);

    expect(childProcess.spawnSync).toHaveBeenCalledWith('yarn', ['remove', 'react'], expect.any(Object));

    expect(typeof getPackageDeps().react === 'undefined').toBeTruthy();

    // Restore original mock
    (childProcess.spawnSync as any).mockImplementation(originalSpawnSync);
  });
});
