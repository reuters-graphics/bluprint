export { default as add } from './commands/add/index.js';
export { default as newBluprint } from './commands/new/index.js';
export { default as remove } from './commands/remove/index.js';
export { default as start } from './commands/start/index.js';
export { default as clone } from './commands/clone/index.js';
export { default as token } from './commands/token/index.js';

export { default as handleActions } from './actions/index.js';

// Need to capture process exit explicitly, as prompts
// handles this differently to escape each question...
process.stdin.on(
  'keypress',
  (str: string, key: { ctrl: boolean; name: string }) => {
    if (key.ctrl && key.name === 'c') process.exit(0);
  }
);
process.on('SIGINT', () => {
  process.exit(0);
});
process.on('SIGTERM', () => {
  process.exit(0);
});
