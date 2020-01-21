const defaultFs = require('fs');
const getUserConfig = require('../../utils/getUserConfig');
const fetchBluprintrc = require('../../utils/fetchBluprintrc');
const chooseBluprint = require('./chooseBluprint');
const hostedGitInfo = require('hosted-git-info');
const fetchBluprint = require('./fetchBluprint');
const handleActions = require('../../actions');

const defaultInject = {
  method: null,
  category: null,
  bluprint: null,
};

module.exports = async(name = null, inject = defaultInject, fs = defaultFs) => {
  const { bluprints } = getUserConfig(fs);

  if (!name) {
    name = await chooseBluprint(fs, inject);
  }

  const bluprint = bluprints[name];

  const git = hostedGitInfo.fromUrl(`${bluprint.user}/${bluprint.project}`);

  const bluprintrc = await fetchBluprintrc(git.file('.bluprintrc'));

  await fetchBluprint(git.tarball(), fs);

  await handleActions(bluprintrc.actions, fs);
};
