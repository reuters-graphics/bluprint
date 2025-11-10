import chalk from 'chalk';
import getLogger from '../../utils/getLogger.js';
import getUserConfig from '../../utils/getUserConfig.js';
import prompts from 'prompts';
import writeUserConfig from '../../utils/writeUserConfig.js';

const logger = getLogger();

export default async (name: string | null = null, inject: any[] | null = null): Promise<void> => {
  const userConfig = getUserConfig();

  if (!name) {
    if (inject) prompts.inject(inject);

    const bluprints = Object.keys(userConfig.bluprints);

    bluprints.sort();

    const { answer } = await prompts([{
      type: 'autocomplete',
      name: 'answer',
      message: 'Which bluprint do you want to remove?',
      choices: bluprints.map((name) => ({
        title: name,
        value: name,
      })),
    }]);

    name = answer;
  }

  if (name && name in userConfig.bluprints) {
    delete userConfig.bluprints[name];
    writeUserConfig(userConfig);

    logger.info(chalk`Removed bluprint {green ${name}}.`);
  } else {
    logger.info(chalk`Couldn't find a bluprint with the name {green ${name || 'unknown'}}.`);
  }
};
