import chalk from 'chalk';
import getLogger from '../../utils/getLogger';
import getUserConfig from '../../utils/getUserConfig';
import prompts from 'prompts';
import writeUserConfig from '../../utils/writeUserConfig';

const logger = getLogger();

export default async function(accessToken = null, inject = null) {
  const userConfig = getUserConfig();

  const { token } = userConfig;

  if (inject) prompts.inject(inject);

  if (accessToken) {
    userConfig.token = accessToken;
  } else if (token) {
    const { confirm, newToken } = await prompts([{
      type: 'confirm',
      name: 'confirm',
      message: chalk`You've already registered a personal access token:\n{green ${token}}\n\nDo you want to change this token?`,
    }, {
      type: prev => prev === true ? 'text' : null,
      name: 'newToken',
      message: `OK, what's your new personal access token?\n`,
    }]);
    if (!confirm) {
      logger.info(`OK, we'll keep the same token going.`);
      return;
    }
    userConfig.token = newToken;
  } else {
    const { newToken } = await prompts([{
      type: 'text',
      name: 'newToken',
      message: `Let's save a personal access token. Get one from GitHub and then enter it below:\n`,
    }]);
    userConfig.token = newToken;
  }
  writeUserConfig(userConfig);
  logger.info(chalk`{green Success!} Saved your new personal access token.`);
};
