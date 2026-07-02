/** The editable segments of the datetime prompt, in display order. */
export const FIELDS = ['year', 'month', 'day', 'hour', 'minute'] as const;

export type Field = (typeof FIELDS)[number];

/** Move to the next/previous field, wrapping around either end. */
export const moveField = (current: Field, direction: 1 | -1): Field => {
  const index = FIELDS.indexOf(current);
  const next = (index + direction + FIELDS.length) % FIELDS.length;
  return FIELDS[next];
};

/**
 * Return a new Date with `field` incremented/decremented by `direction`. Native
 * `Date` setters handle rollover (e.g. Dec + 1 → Jan of next year, 23:59 + 1min
 * → next day).
 */
export const applyDelta = (
  date: Date,
  field: Field,
  direction: 1 | -1
): Date => {
  const next = new Date(date);
  switch (field) {
    case 'year':
      next.setFullYear(next.getFullYear() + direction);
      break;
    case 'month':
      next.setMonth(next.getMonth() + direction);
      break;
    case 'day':
      next.setDate(next.getDate() + direction);
      break;
    case 'hour':
      next.setHours(next.getHours() + direction);
      break;
    case 'minute':
      next.setMinutes(next.getMinutes() + direction);
      break;
  }
  return next;
};

const pad = (value: number, length = 2): string =>
  String(value).padStart(length, '0');

/** The zero-padded string parts of a date, keyed by field. */
const parts = (date: Date): Record<Field, string> => ({
  year: pad(date.getFullYear(), 4),
  month: pad(date.getMonth() + 1),
  day: pad(date.getDate()),
  hour: pad(date.getHours()),
  minute: pad(date.getMinutes()),
});

/** Format a date as `YYYY-MM-DD HH:MM`. */
export const format = (date: Date): string => {
  const p = parts(date);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
};

/**
 * Like {@link format}, but runs the active field's segment through `highlight`
 * (kept color-agnostic so it's testable without a terminal).
 */
export const formatWithActive = (
  date: Date,
  active: Field,
  highlight: (segment: string) => string
): string => {
  const p = parts(date);
  const seg = (field: Field) =>
    field === active ? highlight(p[field]) : p[field];
  return `${seg('year')}-${seg('month')}-${seg('day')} ${seg('hour')}:${seg('minute')}`;
};
