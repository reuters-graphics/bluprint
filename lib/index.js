const newBluprint = require('./commands/new');
const add = require('./commands/add');
const remove = require('./commands/remove');
const start = require('./commands/start');

// Need to capture process exit explicitly, as prompts
// handles this differently to escape each question...
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') process.exit();
});

module.exports = {
  newBluprint,
  add,
  remove,
  start,
};
