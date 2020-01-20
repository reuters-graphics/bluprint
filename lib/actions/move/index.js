const path = require('path');
const chalk = require('chalk');
const logger = require('../../utils/getLogger')();

const move = (oldRelativePath, newRelativePath, fs) => {
  const ROOT = process.cwd();
  const oldPath = path.join(ROOT, oldRelativePath);
  const newPath = path.join(ROOT, newRelativePath);
  const dirPath = path.dirname(newPath);

  if (!fs.existsSync(oldPath)) {
    logger.warn(chalk`Unable to find file {green.underline ${oldRelativePath}} in move action. Skipping.`);
    return;
  }

  fs.mkdirSync(dirPath, { recursive: true });
  fs.renameSync(oldPath, newPath);
};

module.exports = (action, fs) => {
  const { paths } = action;

  if (Array.isArray(paths[0])) {
    paths.forEach((paths) => move(...paths, fs));
  } else {
    move(...paths, fs);
  }
};
