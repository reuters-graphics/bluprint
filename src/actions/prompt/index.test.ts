import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import { handleActions } from '../../index.js';

describe('Test action: prompt', () => {
  beforeAll(() => {
    mockFs({});
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Asks questions and adds answers to context', async () => {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'answer',
        message: 'What\'s the rumpus?',
      }],
      inject: ['nuthin'],
    }];

    const context = await handleActions(actions, undefined);

    expect(context.answer).toBe('nuthin');
  });
});
