import fs from 'node:fs';
import path from 'node:path';
import dedent from 'dedent';
import chalk from 'chalk-template';
import { log } from '@clack/prompts';

import * as prompts from '../../prompts';
import { version } from '../../../package.json';

const CONFIG_FILE = 'bluprint.config.ts';

const template = (name: string): string =>
  dedent`
    import { defineConfig } from '@reuters-graphics/bluprint';

    export default defineConfig({
      name: ${JSON.stringify(name)},
      bluprint: '^${version}',
      files: ['**/*'],
      ignores: [],
      actions: [],
    });
  ` + '\n';

/**
 * Scaffold a starter `bluprint.config.ts` in the current directory so a repo can
 * become a bluprint. Refuses if one already exists.
 *
 * @param name The bluprint's name. If omitted, the user is prompted.
 */
export const newBluprint = async (name?: string): Promise<void> => {
  const filePath = path.resolve(process.cwd(), CONFIG_FILE);

  if (fs.existsSync(filePath)) {
    log.info(
      chalk`Looks like this is already a bluprint — see {green ${CONFIG_FILE}}.`
    );
    return;
  }

  const bluprintName =
    name ??
    (await prompts.text({ message: 'What should we call this bluprint?' }));

  fs.writeFileSync(filePath, template(bluprintName));

  log.success(
    chalk`Created {green ${CONFIG_FILE}} for {green ${bluprintName}}. Add your files and actions, then run {yellow bluprint add} to register it.`
  );
};
