const expect = require('expect.js');
const mock = require('mock-fs');
const { handleActions } = require('../../dist/index.js');
const sinon = require('sinon');
const chalk = require('chalk');

let spy;

describe('Test action: log', function() {
  this.timeout(10000);

  beforeEach(function() {
    mock({});
    spy = sinon.spy(console, 'log');
  });

  afterEach(function() {
    mock.restore();
    spy.restore();
  });

  it('Logs a simple message', async function() {
    const actions = [{
      action: 'log',
      msg: 'a message',
    }];

    await handleActions(actions, null);

    expect(spy.calledWith('a message')).to.be(true);
  });

  it('Logs a chalky message', async function() {
    const actions = [{
      action: 'log',
      msg: 'a {green message}',
    }];

    await handleActions(actions, null);

    expect(spy.calledWith(chalk`a {green message}`)).to.be(true);
  });

  it('Logs a message rendered with context from prompt', async function() {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'answer',
        message: 'Wut',
      }],
      inject: ['nice'],
    }, {
      action: 'log',
      msg: 'a {green {{answer}} message}',
    }];

    await handleActions(actions, null);

    expect(spy.calledWith(chalk`a {green nice message}`)).to.be(true);
  });

  it('Logs a message rendered with default context', async function() {
    const actions = [{
      action: 'log',
      msg: 'a {green {{ year }} message}',
    }];

    await handleActions(actions, null);

    expect(spy.calledWith(chalk`a {green ${new Date().getFullYear()} message}`)).to.be(true);
  });
});
