const defaultFs = require('fs');
const getUserConfig = require('../../utils/getUserConfig');
const chooseBluprint = require('./chooseBluprint');
const hostedGitInfo = require('hosted-git-info');
const fetchBluprint = require('./fetchBluprint');
const handleActions = require('../../actions');

const defaultInject = {
  method: [],
  category: [],
  bluprint: [],
};

module.exports = async(name = null, inject = defaultInject, fs = defaultFs) => {
  const { bluprints } = getUserConfig(fs);

  if (!name) {
    name = await chooseBluprint(fs, inject);
  }

  const bluprint = bluprints[name];

  const gitInfo = hostedGitInfo.fromUrl(`${bluprint.user}/${bluprint.project}`);

  const tarballUrl = gitInfo.tarball();

  await fetchBluprint(tarballUrl, fs);

  await handleActions(bluprint.actions, fs);
};
