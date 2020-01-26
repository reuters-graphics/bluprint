import userConfig from '../constants/userConfig';

export default (data, fs) => {
  fs.writeFileSync(userConfig, JSON.stringify(data));
};
