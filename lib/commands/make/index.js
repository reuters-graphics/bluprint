const defaultFs = require('fs');
const prompts = require('prompts');
const path = require('path');
const chalk = require('chalk');
const defaultConfig = require('./default');
const logger = require('../../utils/getLogger')();

module.exports = async(name, inject = null, fs = defaultFs) => {
  const filePath = path.resolve(process.cwd(), '.bluprintrc');

  if (fs.existsSync(filePath)) {
    logger.info(chalk`Looks like this is already a bluprint. Check the {green .blurprintrc} file.`);
    return;
  }

  if (!name) {
    if (inject) prompts.inject(inject);

    const { answer } = await prompts([{
      type: 'text',
      name: 'answer',
      message: `What should we call this bluprint?`,
    }]);

    name = answer;
  }

  const config = Object.assign({}, defaultConfig, { name });

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));

  logger.info(chalk`Started your new bluprint {green.underline ${name}} in {green .bluprintrc}.`);
};
