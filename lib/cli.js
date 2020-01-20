const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const { make, newProject, add, remove } = require('.');

const yargs = require('yargs');

updateNotifier({ pkg }).notify();

yargs // eslint-disable-line
  .help()
  .scriptName('bluprint')

  // New
  .command('new [bluprint]', 'Creates a new project from a bluprint.', (yargs) => {
    yargs
      .positional('bluprint', {
        describe: 'The bluprint to use',
        type: 'string',
      });
  }, async function({ bluprint }) {
    await newProject(bluprint);
  })

  // Add
  .command('add [path]', 'Registers a new bluprint.', (yargs) => {
    yargs
      .positional('path', {
        describe: 'The GitHub path for the bluprint',
        type: 'string',
      });
  }, async function({ path }) {
    await add(path);
  })

  // Remove
  .command('remove [bluprint]', 'Removes a bluprint.', (yargs) => {
    yargs
      .positional('bluprint', {
        describe: 'The bluprint to remove',
        type: 'string',
      });
  }, async function({ bluprint }) {
    await remove(bluprint);
  })

  // Make
  .command('make [name]', 'Creates a .bluprintrc file', (yargs) => {
    yargs
      .positional('name', {
        describe: 'The name of your bluprint',
        type: 'string',
      });
  }, async function({ name }) {
    await make(name);
  })
  .argv;
