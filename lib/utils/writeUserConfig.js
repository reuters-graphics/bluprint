import fs from 'fs';
import userConfig from '../constants/userConfig';

export default (data) => {
  fs.writeFileSync(userConfig, JSON.stringify(data));
};
