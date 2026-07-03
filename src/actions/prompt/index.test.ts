import { describe, it, expect, afterEach, vi } from 'vitest';
import { prompt } from './index';
import { runtime } from '../../runtime';
import type { ActionContext } from '../types';

vi.mock('../../prompts', () => ({
  text: vi.fn(),
  confirm: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  datetime: vi.fn(),
}));

import * as prompts from '../../prompts';

const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});

describe('prompt action', () => {
  afterEach(() => {
    vi.clearAllMocks();
    runtime.interactive = true; // restore default between tests
  });

  it('runs a text prompt and returns the answer under `name`', async () => {
    vi.mocked(prompts.text).mockResolvedValue('my-project');

    const result = await prompt({
      name: 'projectName',
      type: 'text',
      message: 'Project name?',
    }).run(ctx());

    expect(prompts.text).toHaveBeenCalledOnce();
    expect(result).toEqual({ projectName: 'my-project' });
  });

  it('dispatches to the confirm wrapper for type confirm', async () => {
    vi.mocked(prompts.confirm).mockResolvedValue(true);

    const result = await prompt({
      name: 'useTs',
      type: 'confirm',
      message: 'Use TypeScript?',
    }).run(ctx());

    expect(prompts.confirm).toHaveBeenCalledOnce();
    expect(prompts.text).not.toHaveBeenCalled();
    expect(result).toEqual({ useTs: true });
  });

  it('dispatches to the select wrapper for type select', async () => {
    vi.mocked(prompts.select).mockResolvedValue('b');

    const result = await prompt({
      name: 'choice',
      type: 'select',
      message: 'Pick one',
      options: [{ value: 'a' }, { value: 'b' }],
    }).run(ctx());

    expect(prompts.select).toHaveBeenCalledOnce();
    expect(result).toEqual({ choice: 'b' });
  });

  it('uses an injected value from context and does not prompt', async () => {
    const result = await prompt({
      name: 'projectName',
      type: 'text',
      message: 'Project name?',
    }).run(ctx({ projectName: 'from-input' }));

    expect(prompts.text).not.toHaveBeenCalled();
    expect(result).toEqual({}); // value already in context, nothing to merge
  });

  it('falls back to initialValue in non-interactive mode', async () => {
    runtime.interactive = false;

    const result = await prompt({
      name: 'projectName',
      type: 'text',
      message: 'Project name?',
      initialValue: 'Default Name',
    }).run(ctx());

    expect(prompts.text).not.toHaveBeenCalled();
    expect(result).toEqual({ projectName: 'Default Name' });
  });

  it('throws for a missing required input in non-interactive mode', async () => {
    runtime.interactive = false;

    await expect(
      prompt({
        name: 'projectName',
        type: 'text',
        message: 'Project name?',
      }).run(ctx())
    ).rejects.toThrow(/Missing required input "projectName"/);
    expect(prompts.text).not.toHaveBeenCalled();
  });
});
