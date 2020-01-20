const defaultFs = require('fs');
const chalk = require('chalk');
const prompts = require('prompts');
const Ajv = require('ajv');
const hostedGitInfo = require('hosted-git-info');
const fetchConfig = require('./fetchConfig');
const getUserConfig = require('../../utils/getUserConfig');
const writeUserConfig = require('../../utils/writeUserConfig');
const logger = require('../../utils/getLogger')();
const schema = require('../../schema');

module.exports = async function(githubURL, inject = [], fs = defaultFs) {
  if (!githubURL) {
    prompts.inject(inject);
    const { answer } = await prompts([{
      type: 'text',
      name: 'answer',
      message: chalk`Which repo has your bluprint?\nYou can format that as "user/repo", "https://..." or "git@github.com...".\n`,
    }]);
    githubURL = answer;
  }

  const gitInfo = hostedGitInfo.fromUrl(githubURL);

  const configUrl = gitInfo.file('.bluprintrc');

  // TODO: Better handle 404s
  const bluprintConfig = await fetchConfig(configUrl);

  const ajv = new Ajv({ allErrors: true, verbose: true });

  const valid = ajv.validate(schema, bluprintConfig);
  if (!valid) {
    logger.error('The repo\'s .bluprintrc is invalid.');
    return;
  }

  const userConfig = getUserConfig(fs);
  if (!userConfig.bluprints) {
    userConfig.bluprints = {};
  }

  const { user, project } = gitInfo;
  const category = bluprintConfig.category || '';

  userConfig.bluprints[bluprintConfig.name] = {
    user,
    project,
    category,
  };

  writeUserConfig(userConfig, fs);

  logger.info(chalk`Added bluprint {green ${bluprintConfig.name}}. Run {yellow bluprint new} to start a new project.`);
};
