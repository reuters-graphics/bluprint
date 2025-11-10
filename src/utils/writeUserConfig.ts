import fs from 'fs';
import userConfig from '../constants/userConfig.js';

export default (data: any): void => {
  fs.writeFileSync(userConfig, JSON.stringify(data));
};
