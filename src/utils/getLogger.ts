import * as winston from 'winston';
import chalk from 'chalk';

const consoleFormat = winston.format.printf((info) => {
  const { level, message } = info;
  const msg = String(message);
  if (level === 'error') return `\n${chalk.blue('bluprint:')} ${chalk.bgRed('ERROR')} ${msg}\n`;
  if (level === 'warn') return `\n${chalk.blue('bluprint:')} ${chalk.bgYellow('warn')} ${msg}\n`;
  return `\n${chalk.blue('bluprint:')}  ${msg}\n`;
});

export default (): winston.Logger => {
  if (process.env.NODE_ENV !== 'test') {
    return winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console(),
      ],
      format: consoleFormat,
    });
  } else {
    return winston.createLogger({
      level: 'error',
      transports: [
        new winston.transports.Console(),
      ],
    });
  }
};
