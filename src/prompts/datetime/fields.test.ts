import { describe, it, expect } from 'vitest';
import {
  FIELDS,
  moveField,
  applyDelta,
  format,
  formatWithActive,
} from './fields';

describe('moveField', () => {
  it('moves forward and wraps past the last field', () => {
    expect(moveField('year', 1)).toBe('month');
    expect(moveField('minute', 1)).toBe('year');
  });

  it('moves backward and wraps past the first field', () => {
    expect(moveField('month', -1)).toBe('year');
    expect(moveField('year', -1)).toBe('minute');
  });

  it('covers every field', () => {
    expect(FIELDS).toEqual(['year', 'month', 'day', 'hour', 'minute']);
  });
});

describe('applyDelta', () => {
  const at = (s: string) => new Date(s);

  it('increments each field', () => {
    const d = at('2026-06-15T10:30:00');
    expect(applyDelta(d, 'year', 1).getFullYear()).toBe(2027);
    expect(applyDelta(d, 'month', 1).getMonth()).toBe(6); // July (0-indexed)
    expect(applyDelta(d, 'day', 1).getDate()).toBe(16);
    expect(applyDelta(d, 'hour', 1).getHours()).toBe(11);
    expect(applyDelta(d, 'minute', 1).getMinutes()).toBe(31);
  });

  it('rolls over: December + 1 month → next January', () => {
    const r = applyDelta(at('2026-12-10T00:00:00'), 'month', 1);
    expect(r.getFullYear()).toBe(2027);
    expect(r.getMonth()).toBe(0);
  });

  it('rolls over: last minute of day + 1 → next day 00:00', () => {
    const r = applyDelta(at('2026-06-15T23:59:00'), 'minute', 1);
    expect(r.getDate()).toBe(16);
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
  });

  it('rolls back: first minute of day - 1 → previous day 23:59', () => {
    const r = applyDelta(at('2026-06-15T00:00:00'), 'minute', -1);
    expect(r.getDate()).toBe(14);
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
  });

  it('does not mutate the input date', () => {
    const d = at('2026-06-15T10:30:00');
    applyDelta(d, 'year', 1);
    expect(d.getFullYear()).toBe(2026);
  });
});

describe('format / formatWithActive', () => {
  it('zero-pads to YYYY-MM-DD HH:MM', () => {
    expect(format(new Date('2026-07-02T09:05:00'))).toBe('2026-07-02 09:05');
  });

  it('formatWithActive with an identity highlight equals format', () => {
    const d = new Date('2026-07-02T09:05:00');
    expect(formatWithActive(d, 'day', (s) => s)).toBe(format(d));
  });

  it('highlights only the active segment', () => {
    const d = new Date('2026-07-02T09:05:00');
    expect(formatWithActive(d, 'hour', (s) => `[${s}]`)).toBe(
      '2026-07-02 [09]:05'
    );
  });
});
