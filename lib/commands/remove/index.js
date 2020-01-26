import chalk from 'chalk';
import defaultFs from 'fs';
import getLogger from '../../utils/getLogger';
import getUserConfig from '../../utils/getUserConfig';
import prompts from 'prompts';
import writeUserConfig from '../../utils/writeUserConfig';

const logger = getLogger();

export default async(name = null, inject = null, fs = defaultFs) => {
  const userConfig = getUserConfig(fs);

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

  if (name in userConfig.bluprints) {
    delete userConfig.bluprints[name];
    writeUserConfig(userConfig, fs);

    logger.info(chalk`Removed bluprint {green ${name}}.`);
  } else {
    logger.info(chalk`Couldn't find a bluprint with the name {green ${name}}.`);
  }
};
