import * as winston from 'winston';

import chalk from 'chalk';

const consoleFormat = winston.format.printf(({ level, message }) => {
  if (level === 'error') return chalk`\n{blue bluprint:} {bgRed ERROR} ${message}\n`;
  if (level === 'warn') return chalk`\n{blue bluprint:} {bgYellow warn} ${message}\n`;
  return chalk`\n{blue bluprint:}  ${message}\n`;
});

export default () => {
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
