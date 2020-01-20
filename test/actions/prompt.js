const expect = require('expect.js');
const { fs } = require('memfs');
const handleActions = require('../../lib/actions');

describe('Test action: prompt', function() {
  this.timeout(10000);

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

    const context = await handleActions(actions, fs);

    expect(context.answer).to.be('nuthin');
  });
});
