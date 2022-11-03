import getLogger from './getLogger';

const logger = getLogger();

export default () => {
  logger.warn(`Did you recently update your token and perhaps forgot to add it to bluprint?`);
  logger.info(`Run this command:`);
  logger.info(`bluprint token PASTE_YOUR_NEW_TOKEN_HERE`)
};