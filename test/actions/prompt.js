const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const { handleActions } = require('../../dist/index.js');

describe('Test action: prompt', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

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

    const context = await handleActions(actions, null, fs);

    expect(context.answer).to.be('nuthin');
  });
});
