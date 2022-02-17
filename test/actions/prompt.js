const expect = require('expect.js');
const mock = require('mock-fs');
const { handleActions } = require('../../dist/index.js');

describe('Test action: prompt', function() {
  this.timeout(10000);

  before(function() {
    mock({});
  });

  after(function() {
    mock.restore();
  });

  it('Asks questions and adds answers to context', async function() {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'answer',
        message: 'What\'s the rumpus?',
      }],
      inject: ['nuthin'],
    }];

    const context = await handleActions(actions, null);

    expect(context.answer).to.be('nuthin');
  });
});
