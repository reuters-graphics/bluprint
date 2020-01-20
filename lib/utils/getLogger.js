const winston = require('winston');
const chalk = require('chalk');

const { printf } = winston.format;

const format = printf(({ level, message }) => {
  if (level === 'error') return chalk`\n{blue bluprint:} {bgRed ERROR} ${message}\n`;
  return chalk`\n{blue.underline bluprint:}  ${message}\n`;
});

module.exports = () => {
  if (process.env.NODE_ENV !== 'test') {
    return winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console(),
      ],
      format,
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
