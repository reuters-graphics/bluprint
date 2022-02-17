import chalk from 'chalk';
import fetchBluprintrc from '../../utils/fetchBluprintrc';
import getLogger from '../../utils/getLogger';
import getUserConfig from '../../utils/getUserConfig';
import hostedGitInfo from 'hosted-git-info';
import prompts from 'prompts';
import writeUserConfig from '../../utils/writeUserConfig';

const logger = getLogger();

export default async function(githubURL, inject = null) {
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

  const userConfig = getUserConfig();
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

  writeUserConfig(userConfig);

  logger.info(chalk`Added bluprint {green ${bluprintrc.name}}. Run {yellow bluprint start} to start a new project.`);
};
