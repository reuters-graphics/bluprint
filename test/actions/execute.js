const expect = require('expect.js');
const { fs } = require('memfs');
const realFS = require('fs');
const { handleActions } = require('../../dist/index.js');
const sinon = require('sinon');
const childProcess = require('child_process');
const path = require('path');

let spy;

const getPackageDeps = () => { // eslint-disable-line no-unused-vars
  const packageJson = realFS.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8');
  return JSON.parse(packageJson).dependencies;
};

describe('Test action: execute', function() {
  this.timeout(60000);

  beforeEach(function() {
    spy = sinon.spy(childProcess, 'spawnSync');
  });

  afterEach(function() {
    spy.restore();
  });

  it('Executes a simple process', async function() {
    const actions = [{
      action: 'execute',
      cmds: [['echo', ['cat']]],
    }];

    await handleActions(actions, null, fs);

    expect(spy.calledWith('echo', ['cat'])).to.be(true);
  });

  // This takes a while...
  // it('Executes a long running process', async function() {
  //   const addActions = [{
  //     action: 'execute',
  //     cmds: [['yarn', ['add', 'react']]],
  //   }];
  //
  //   await handleActions(addActions, fs);
  //
  //   expect(spy.calledWith('yarn', ['add', 'react'])).to.be(true);
  //
  //   expect(getPackageDeps()).to.have.property('react');
  //
  //   const removeActions = [{
  //     action: 'execute',
  //     cmds: [['yarn', ['remove', 'react']]],
  //   }];
  //
  //   await handleActions(removeActions, null, fs);
  //
  //   expect(spy.calledWith('yarn', ['remove', 'react'])).to.be(true);
  //
  //   expect(typeof getPackageDeps().react === 'undefined').to.be.ok();
  // });
});
