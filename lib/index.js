const make = require('./commands/make');
const add = require('./commands/add');
const remove = require('./commands/remove');
const newProject = require('./commands/new');

// Need to capture process exit explicitly, as prompts
// handles this differently to escape each question...
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') process.exit();
});

module.exports = {
  make,
  add,
  remove,
  newProject,
};
