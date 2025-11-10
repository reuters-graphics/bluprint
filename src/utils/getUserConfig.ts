import fs from 'fs';
import userConfigPath from '../constants/userConfig.js';
import { version } from '../../package.json';
import type { UserConfig } from '../types.js';

const defaultUserConfig: UserConfig = {
  version,
  bluprints: {},
};

export default (): UserConfig => {
  if (!fs.existsSync(userConfigPath)) {
    fs.writeFileSync(userConfigPath, JSON.stringify(defaultUserConfig));
  }
  const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8')) as UserConfig;

  // Update version
  if (version !== userConfig.version) {
    userConfig.version = version;
    fs.writeFileSync(userConfigPath, JSON.stringify(userConfig));
  }

  return userConfig;
};
