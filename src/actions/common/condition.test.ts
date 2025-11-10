import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mockFs from 'mock-fs';
import { handleActions } from '../../index.js';
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

describe('Test action: conditionals', () => {
  beforeEach(() => {
    mockFs({});
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFs.restore();
    vi.restoreAllMocks();
  });

  it('Skips a false condition', async () => {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'answer',
        message: 'What\'s the rumpus?',
      }],
      inject: ['nuthin'],
    }, {
      action: 'execute',
      condition: ['answer', 'different'],
      cmds: [['echo', ['cat']]],
    }, {
      action: 'execute',
      condition: ['answer', 'nuthin'],
      cmds: [['echo', ['dog']]],
    }];

    await handleActions(actions, undefined);

    expect(childProcess.spawnSync).not.toHaveBeenCalledWith('echo', ['cat'], expect.any(Object));
    expect(childProcess.spawnSync).toHaveBeenCalledWith('echo', ['dog'], expect.any(Object));
  });

  it('Doesn\'t skip an action if condition variable isn\'t found', async () => {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'answer',
        message: 'What\'s the rumpus?',
      }],
      inject: ['nuthin'],
    }, {
      action: 'execute',
      condition: ['answr.something.else', 'different'],
      cmds: [['echo', ['cat']]],
    }];

    await handleActions(actions, undefined);

    expect(childProcess.spawnSync).toHaveBeenCalledWith('echo', ['cat'], expect.any(Object));
  });
});
