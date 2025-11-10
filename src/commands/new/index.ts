import chalk from 'chalk';
import defaultConfig from './default.js';
import fs from 'fs';
import getLogger from '../../utils/getLogger.js';
import path from 'path';
import prompts from 'prompts';

const logger = getLogger();

export default async (name: string | null, inject: any[] | null = null): Promise<void> => {
  const filePath = path.resolve(process.cwd(), '.bluprintrc');

  if (fs.existsSync(filePath)) {
    logger.info(chalk`Looks like this is already a bluprint. Check the {green .blurprintrc} file.`);
    return;
  }

  let bluprintName = name;

  if (!bluprintName) {
    if (inject) prompts.inject(inject);

    const { answer } = await prompts([{
      type: 'text',
      name: 'answer',
      message: `What should we call this bluprint?`,
    }]);

    bluprintName = answer;
  }

  const config = Object.assign({}, defaultConfig, { name: bluprintName });

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));

  logger.info(chalk`Started your new bluprint {green.underline ${bluprintName || 'unnamed'}} in {green .bluprintrc}.`);
};
