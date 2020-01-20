const defaultFs = require('fs');
const chalk = require('chalk');
const prompts = require('prompts');
const hostedGitInfo = require('hosted-git-info');
const fetchBluprintrc = require('../../utils/fetchBluprintrc');
const getUserConfig = require('../../utils/getUserConfig');
const writeUserConfig = require('../../utils/writeUserConfig');
const logger = require('../../utils/getLogger')();

module.exports = async function(githubURL, inject = null, fs = defaultFs) {
  if (!githubURL) {
    if (inject) prompts.inject(inject);
    const { answer } = await prompts([{
      type: 'text',
      name: 'answer',
      message: chalk`Which repo has your bluprint?\nYou can format that as "user/repo", "https://..." or "git@...".\n`,
    }]);
    githubURL = answer;
  }

  const gitInfo = hostedGitInfo.fromUrl(githubURL);

  const rcUrl = gitInfo.file('.bluprintrc');

  // TODO: Better handle 404s
  const bluprintrc = await fetchBluprintrc(rcUrl);

  const userConfig = getUserConfig(fs);
  if (!userConfig.bluprints) {
    userConfig.bluprints = {};
  }

  const { user, project } = gitInfo;
  const category = bluprintrc.category || '';

  userConfig.bluprints[bluprintrc.name] = {
    user,
    project,
    category,
  };

  writeUserConfig(userConfig, fs);

  logger.info(chalk`Added bluprint {green ${bluprintrc.name}}. Run {yellow bluprint new} to start a new project.`);
};
