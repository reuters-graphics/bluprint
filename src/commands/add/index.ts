import chalk from 'chalk';
import fetchBluprintrc from '../../utils/fetchBluprintrc.js';
import getLogger from '../../utils/getLogger.js';
import getUserConfig from '../../utils/getUserConfig.js';
import hostedGitInfo from 'hosted-git-info';
import prompts from 'prompts';
import writeUserConfig from '../../utils/writeUserConfig.js';

const logger = getLogger();

export default async function (githubURL: string | null, inject: any[] | null = null): Promise<void> {
  let url = githubURL;

  if (!url) {
    if (inject) prompts.inject(inject);
    const { answer } = await prompts([{
      type: 'text',
      name: 'answer',
      message: chalk`Which repo has your bluprint?\nYou can format that as "user/repo", "https://..." or "git@...".\n`,
    }]);
    url = answer;
  }

  if (!url) {
    logger.error('No URL provided');
    return;
  }

  const gitInfo = hostedGitInfo.fromUrl(url);

  if (!gitInfo) {
    logger.error('Invalid GitHub URL');
    return;
  }

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
}
