import { Prompt } from '@clack/core';
import { S_BAR, S_BAR_END, symbol } from '@clack/prompts';
import color from 'picocolors';
import { applyDelta, formatWithActive, moveField, type Field } from './fields';

export interface DateTimeOptions {
  message: string;
  /** Starting value. Defaults to now. Seconds/milliseconds are zeroed. */
  initialValue?: Date;
  validate?: (value: Date) => string | Error | undefined;
}

/**
 * A date **and time** picker built on `@clack/core`'s `Prompt`. Left/right move
 * between year/month/day/hour/minute; up/down increment/decrement the active
 * field (with native rollover); enter submits, Ctrl-C cancels. Rendered with
 * `@clack/prompts`'s own symbols so it matches the other prompts.
 */
export class DateTimePrompt extends Prompt<Date> {
  private readonly message: string;
  private activeField: Field = 'year';

  constructor({
    message,
    initialValue = new Date(),
    validate,
  }: DateTimeOptions) {
    super(
      {
        render: () => this.renderFrame(),
        // clack types the validated value as `Date | undefined`; ours is always
        // a set Date, so adapt at the boundary and keep our API non-nullable.
        validate:
          validate ? (value) => validate(value ?? new Date()) : undefined,
      },
      false
    );
    this.message = message;

    const start = new Date(initialValue);
    start.setSeconds(0);
    start.setMilliseconds(0);
    this.value = start;

    this.on('cursor', (action) => {
      const current = this.value ?? new Date();
      switch (action) {
        case 'left':
          this.activeField = moveField(this.activeField, -1);
          break;
        case 'right':
          this.activeField = moveField(this.activeField, 1);
          break;
        case 'up':
          this.value = applyDelta(current, this.activeField, 1);
          break;
        case 'down':
          this.value = applyDelta(current, this.activeField, -1);
          break;
      }
    });
  }

  private renderFrame(): string {
    const value = this.value ?? new Date();
    const plain = formatWithActive(value, this.activeField, (s) => s);
    const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${this.message}\n`;

    switch (this.state) {
      case 'submit':
        return `${title}${color.gray(S_BAR)}  ${color.dim(plain)}`;
      case 'cancel':
        return `${title}${color.gray(S_BAR)}  ${color.strikethrough(color.dim(plain))}`;
      case 'error':
        return (
          `${title}${color.yellow(S_BAR)}  ` +
          `${formatWithActive(value, this.activeField, color.cyan)}\n` +
          `${color.yellow(S_BAR_END)}  ${color.yellow(this.error)}\n`
        );
      default:
        return (
          `${title}${color.cyan(S_BAR)}  ` +
          `${formatWithActive(value, this.activeField, color.cyan)}  ` +
          `${color.dim('↑/↓ ←/→')}\n${color.cyan(S_BAR_END)}\n`
        );
    }
  }
}
