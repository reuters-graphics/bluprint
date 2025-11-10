import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mockFs from 'mock-fs';
import { handleActions } from '../../index.js';
import chalk from 'chalk';

let spy: ReturnType<typeof vi.spyOn>;

describe('Test action: log', () => {
  beforeEach(() => {
    mockFs({});
    spy = vi.spyOn(console, 'log');
  });

  afterEach(() => {
    mockFs.restore();
    vi.restoreAllMocks();
  });

  it('Logs a simple message', async () => {
    const actions = [{
      action: 'log',
      msg: 'a message',
    }];

    await handleActions(actions, undefined);

    expect(spy).toHaveBeenCalledWith('a message');
  });

  it('Logs a chalky message', async () => {
    const actions = [{
      action: 'log',
      msg: 'a {green message}',
    }];

    await handleActions(actions, undefined);

    expect(spy).toHaveBeenCalledWith(chalk`a {green message}`);
  });

  it('Logs a message rendered with context from prompt', async () => {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'answer',
        message: 'Wut',
      }],
      inject: ['nice'],
    }, {
      action: 'log',
      msg: 'a {green {{answer}} message}',
    }];

    await handleActions(actions, undefined);

    expect(spy).toHaveBeenCalledWith(chalk`a {green nice message}`);
  });

  it('Logs a message rendered with default context', async () => {
    const actions = [{
      action: 'log',
      msg: 'a {green {{ year }} message}',
    }];

    await handleActions(actions, undefined);

    expect(spy).toHaveBeenCalledWith(chalk`a {green ${String(new Date().getFullYear())} message}`);
  });
});
