const defaultFs = require('fs');
const prompts = require('prompts');
const chalk = require('chalk');
const getUserConfig = require('../../utils/getUserConfig');
const writeUserConfig = require('../../utils/writeUserConfig');
const logger = require('../../utils/getLogger')();

module.exports = async(name = null, inject = [], fs = defaultFs) => {
  const userConfig = getUserConfig(fs);

  if (!name) {
    prompts.inject(inject);

    const bluprints = Object.keys(userConfig.bluprints);

    bluprints.sort();

    const { answer } = await prompts([{
      type: 'text',
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
